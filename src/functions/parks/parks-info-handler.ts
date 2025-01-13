import { Logger } from '@aws-lambda-powertools/logger';
import { NPSClient } from '../../clients/nps/index.js';

import {
   NPSAuthenticationError,
   NPSNotFoundError,
   NPSRateLimitError,
   NPSValidationError,
} from '../../clients/nps/errors.js';

import {
   DEFAULT_NPS_CLIENT_TIMEOUT,
   POWERTOOLS_SERVICE_NAME,
} from './constants.js';
import {
   AgentRequest,
   AgentResponse,
   ParkBasicInfo,
   ParkDetailedInfo,
} from './types.js';

const logger = new Logger({
   serviceName: POWERTOOLS_SERVICE_NAME,
});

const client = new NPSClient({
   apiKey: process.env.NPS_API_KEY ?? '',
   timeout: DEFAULT_NPS_CLIENT_TIMEOUT,
});

/**
 * Lambda handler to process requests for parks search and details.
 * @param {AgentRequest} event - The incoming request containing API path and parameters.
 * @returns {Promise<AgentResponse>} - The response containing park information or an error message.
 */
export const handler = async (event: AgentRequest): Promise<AgentResponse> => {
   try {
      logger.logEventIfEnabled(event);

      const { apiPath, parameters } = event;

      const stateCodeParam = parameters?.find(
         (param) => param.name === 'stateCode',
      );
      const parkCodeParam = parameters?.find(
         (param) => param.name === 'parkCode',
      );

      const stateCode = stateCodeParam?.value?.toUpperCase();
      const parkCode = parkCodeParam?.value;

      let responseBody: ParkBasicInfo[] | ParkDetailedInfo;
      if (apiPath === '/parks/search') {
         responseBody = await handleParksSearch(stateCode);
      } else if (apiPath === '/parks/details') {
         responseBody = await handleParkDetails(parkCode);
      } else {
         logger.warn('Unsupported API path', { apiPath });
         throw new Error(`Unsupported action: ${apiPath}`);
      }

      const response = {
         messageVersion: '1.0',
         response: {
            actionGroup: 'national-parks-info-action-group',
            apiPath,
            httpMethod: 'GET',
            httpStatusCode: 200,
            responseBody: {
               'application/json': {
                  body: JSON.stringify(responseBody),
               },
            },
         },
         sessionAttributes: {},
      };
      logger.debug(`Response for ${apiPath}`, { response });
      return response;
   } catch (error) {
      logger.error('Error processing request', { error });

      if (error instanceof NPSAuthenticationError) {
         return buildErrorResponse(
            401,
            'Authentication failed. Please check your API key.',
         );
      } else if (error instanceof NPSRateLimitError) {
         return buildErrorResponse(
            429,
            'Rate limit exceeded. Please try again later.',
         );
      } else if (error instanceof NPSNotFoundError) {
         return buildErrorResponse(404, error.message || 'Park not found.');
      } else if (error instanceof NPSValidationError) {
         return buildErrorResponse(400, error.message || 'Invalid request.');
      }
      return buildErrorResponse(500, 'An unexpected error occurred.');
   }
};

/**
 * Fetches parks information by state code.
 *
 * @param {string} stateCode - The state code to filter parks.
 * @returns {Promise<AgentResponse>} - The response containing a list of parks in the state.
 */
const handleParksSearch = async (
   stateCode?: string,
): Promise<ParkBasicInfo[]> => {
   if (!stateCode || stateCode.length !== 2) {
      throw new Error(
         'Invalid or missing stateCode. Provide a two-letter state code.',
      );
   }

   const npsParksSearchResult = await client.getParks({ stateCode, limit: 20 });

   return npsParksSearchResult.data.map((park) => ({
      name: park.name,
      parkCode: park.parkCode,
      fullName: park.fullName,
      stateCode,
      description: park.description,
      url: park.url,
   }));
};

/**
 * Fetches detailed information for a specific park by park code.
 *
 * @param {string} parkCode - The unique code identifying the park.
 * @returns {Promise<AgentResponse>} - The response containing detailed park information.
 */
const handleParkDetails = async (
   parkCode?: string,
): Promise<ParkDetailedInfo> => {
   if (!parkCode) {
      throw new Error('Invalid or missing parkCode. Provide a valid parkCode.');
   }

   const npsPark = await client.getPark(parkCode);

   return {
      name: npsPark.name,
      parkCode: npsPark.parkCode,
      fullName: npsPark.fullName,
      description: npsPark.description,
      url: npsPark.url,
      directionsInfo: npsPark.directionsInfo,
      directionsUrl: npsPark.directionsUrl,
      weatherInfo: npsPark.weatherInfo,
      states: npsPark.states,
      latitude: Number(npsPark.latitude),
      longitude: Number(npsPark.longitude),
      addresses: npsPark.addresses,
      entranceFees: npsPark.entranceFees,
      designation: npsPark.designation,
   };
};

/**
 * Handles errors during Lambda execution and generates an appropriate response.
 *
 * @param {number} statusCode - The HTTP status code for the error.
 * @param {string} message - A descriptive error message.
 * @returns {AgentResponse} - The error response.
 */
const buildErrorResponse = (
   statusCode: number,
   message: string,
): AgentResponse => ({
   messageVersion: '1.0',
   response: {
      actionGroup: 'national-parks-info-action-group',
      apiPath: '', // Set dynamically if needed
      httpMethod: 'GET',
      httpStatusCode: statusCode,
      responseBody: {
         'application/json': {
            body: JSON.stringify({ error: message }),
         },
      },
   },
   sessionAttributes: {},
});
