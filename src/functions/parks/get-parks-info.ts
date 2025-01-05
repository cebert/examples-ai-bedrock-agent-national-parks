import { Logger } from "@aws-lambda-powertools/logger";

import { NPSClient, NPSError, NPSNotFoundError, type Park } from "../../clients/nps/index.js";

const logger = new Logger({
  serviceName: 'national-parks-service',
  logLevel: 'INFO'
});

interface AgentRequest {
  messageVersion: string;
  agent: {
    name: string;
    id: string;
    alias: string;
  };
  inputText: string;
  sessionId: string;
  actionGroup: string;
  action: string;
  parameters: {
    stateCode?: string;
    parkCode?: string;
    limit?: number;
    searchQuery?: string;
  };
}

interface AgentResponse {
  messageVersion: string;
  response: {
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    httpStatusCode: number;
    responseBody: string;
  };
}

/**
 * Creates a readable description of a park, including basic information
 * that would be most relevant to visitors.
 */
const formatParkInfo = (park: Park): string => {
  logger.debug('Formatting park info', { parkCode: park.parkCode });

  const sections = [
    `${park.fullName} (${park.parkCode.toUpperCase()})`,
    `Description: ${park.description}`,
    `Location: ${park.states}`,
    `Designation: ${park.designation}`
  ];

  if (park.weatherInfo) {
    sections.push(`Weather Information: ${park.weatherInfo}`);
  }

  if (park.directionsInfo) {
    sections.push(`Directions: ${park.directionsInfo}`);
  }

  if (park.entranceFees?.length > 0) {
    const fees = park.entranceFees.map(fee =>
      `${fee.title}: $${fee.cost} - ${fee.description}`
    ).join('\n');
    sections.push(`Entrance Fees:\n${fees}`);
  }

  if (park.operatingHours?.length > 0) {
    const hours = park.operatingHours[0].standardHours;
    sections.push(
      'Operating Hours:\n' +
      `Monday: ${hours.monday}\n` +
      `Tuesday: ${hours.tuesday}\n` +
      `Wednesday: ${hours.wednesday}\n` +
      `Thursday: ${hours.thursday}\n` +
      `Friday: ${hours.friday}\n` +
      `Saturday: ${hours.saturday}\n` +
      `Sunday: ${hours.sunday}`
    );
  }

  return sections.filter(Boolean).join('\n\n');
};

/**
 * Creates a simple list of parks with their names and brief descriptions.
 */
const formatParksList = (parks: Park[]): string => {
  logger.debug('Formatting parks list', { count: parks.length });

  if (parks.length === 0) {
    return 'No parks found matching your criteria.';
  }

  const parksList = parks.map(park => {
    const firstSentence = park.description.split('.')[0] + '.';
    return `• ${park.fullName} (${park.parkCode.toUpperCase()})\n${firstSentence}`;
  });

  return parksList.join('\n\n');
};

/**
 * Creates an agent response object with the provided content
 */
const createResponse = (
  actionGroup: string,
  statusCode: number,
  body: unknown
): AgentResponse => ({
  messageVersion: '1.0',
  response: {
    actionGroup,
    apiPath: '/parks',
    httpMethod: 'GET',
    httpStatusCode: statusCode,
    responseBody: JSON.stringify(body)
  }
});

export const handler = async (event: AgentRequest): Promise<AgentResponse> => {
  logger.info('Processing Bedrock agent request', { inputText: event.inputText });

  if (!process.env.NPS_API_KEY) {
    logger.error('Missing NPS_API_KEY environment variable');
    return createResponse(
      event.actionGroup,
      500,
      { error: 'Server configuration error' }
    );
  }

  const client = new NPSClient({
    apiKey: process.env.NPS_API_KEY,
    timeout: 20000,
  });

  try {
    switch (event.action) {
      case 'getParksInState': {
        const stateCode = event.parameters.stateCode?.toUpperCase();
        if (!stateCode) {
          logger.error('Missing stateCode parameter');
          return createResponse(
            event.actionGroup,
            400,
            { error: 'State code is required for getParksInState action' }
          );
        }

        logger.info('Fetching parks by state', { stateCode });
        const response = await client.getParks({
          stateCode,
          limit: event.parameters.limit || 5,
        });

        return createResponse(event.actionGroup, 200, {
          total: response.total,
          formattedResponse: `Here are some National Parks in ${stateCode}:\n\n${formatParksList(response.data)}`,
          parks: response.data,
        });
      }

      case 'getParkDetails': {
        const parkCode = event.parameters.parkCode?.toLowerCase();
        if (!parkCode) {
          logger.error('Missing parkCode parameter');
          return createResponse(
            event.actionGroup,
            400,
            { error: 'Park code is required for getParkDetails action' }
          );
        }

        logger.info('Fetching park details', { parkCode });
        const park = await client.getPark(parkCode);

        return createResponse(event.actionGroup, 200, {
          formattedResponse: formatParkInfo(park),
          park,
        });
      }

      case 'searchParks': {
        const searchQuery = event.parameters.searchQuery;
        if (!searchQuery) {
          logger.error('Missing searchQuery parameter');
          return createResponse(
            event.actionGroup,
            400,
            { error: 'Search query is required for searchParks action' }
          );
        }

        logger.info('Searching parks', {
          searchQuery,
          limit: event.parameters.limit || 5
        });

        const response = await client.getParks({
          q: searchQuery,
          limit: event.parameters.limit || 5,
        });

        return createResponse(event.actionGroup, 200, {
          total: response.total,
          formattedResponse: `Here are parks matching your search for "${searchQuery}":\n\n${formatParksList(response.data)}`,
          parks: response.data,
        });
      }

      default:
        logger.error('Unknown action requested', { action: event.action });
        return createResponse(
          event.actionGroup,
          400,
          { error: `Unknown action: ${event.action}` }
        );
    }
  } catch (error) {
    logger.error('Error processing request', { error });

    let errorMessage = 'An unknown error occurred while processing your request.';
    let statusCode = 500;

    if (error instanceof NPSNotFoundError) {
      errorMessage = error.message;
      statusCode = 404;
    } else if (error instanceof NPSError) {
      errorMessage = `Error accessing park information: ${error.message}`;
      statusCode = error.statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return createResponse(event.actionGroup, statusCode, { error: errorMessage });
  }
};
