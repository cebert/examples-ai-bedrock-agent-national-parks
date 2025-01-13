/**
 * Represents a request coming from a Bedrock Agent
 */
export interface AgentRequest {
   /** Version of the message protocol used. */
   messageVersion: string;
   /** Parameters for the agent, including their name, type, and value. */
   parameters: { name: string; type: string; value: string }[];
   /**
    * API Path
    */
   apiPath: string;
   sessionId: string;
   agent: {
      name: string;
      version: string;
      id: string;
      alias: string;
   };
   /**
    * The name of the action group responsible for this request
    */
   actionGroup: string;
   httpMethod: string;
   sessionAttributes: { [key: string]: string };
   promptSessionAttributes: { [key: string]: string };
   /**
    * Prompt from the user
    */
   inputText: string;
}

export interface AgentResponse {
   messageVersion: string;
   response: {
      actionGroup: string;
      apiPath: string;
      httpMethod: string;
      httpStatusCode: number;
      responseBody: {
         'application/json': {
            body: string; // JSON-formatted string
         };
      };
   };
   sessionAttributes: { [key: string]: string };
}

export interface ParkBasicInfo {
   /**
    * Short park name (no designation)
    */
   name: string;
   /**
    * A variable width character code used to identify a specific park
    */
   parkCode: string;
   /**
    * Full park name (with designation)
    */
   fullName: string;
   /**
    * 2 character state code
    */
   stateCode: string;
   /**
    * Introductory paragraph from the park homepage
    */
   description: string;
   /**
    * Park Website
    */
   url: string;
}

export interface ParkDetailedInfo extends Omit<ParkBasicInfo, 'stateCode'> {
   /**
    * Park addresses (physical and mailing)
    */
   addresses: Array<Record<string, unknown>>;
   /**
    * description:Fee for entering the park
    */
   entranceFees: Array<Record<string, unknown>>;
   /**
    * Latitude
    */
   latitude: number;
   /**
    * Longitude
    */
   longitude: number;
   /**
    * State(s) the park is located in (comma-delimited list)
    */
   states: string;
   /**
    * General description of the weather in the park over the course of a year
    */
   weatherInfo: string;
   /**
    * General overview of how to get to the park
    */
   directionsInfo: string;
   /**
    * Link to page, if available, that provides additional detail on getting to the park
    */
   directionsUrl: string;
   /**
    * Type of designation (eg, national park, national monument, national recreation area, etc)
    */
   designation: string;
}
