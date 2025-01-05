/**
 * Represents the standard response structure from the National Park Service API.
 * All responses follow this pattern, wrapping the actual data in a consistent format.
 */
export interface NPSResponse<T> {
    total: string; // Total number of items available
    limit: string; // Number of items per page
    start: string; // Starting position of this response
    data: T[]; // The actual data returned by the API
  }

  /**
   * Configuration options for the NPS client.
   * This determines how the client will behave and connect to the API.
   */
  export interface NPSClientConfig {
    apiKey: string; // Required API key for authentication
    baseUrl?: string; // Optional override for API endpoint
    defaultLimit?: number; // Default number of results to return
    timeout?: number; // Request timeout in milliseconds
  }

  /**
   * Parameters that can be used to filter park results.
   * These match the query parameters accepted by the NPS API.
   */
  export interface ParkFilters {
    stateCode?: string; // Two-letter state code (e.g., 'CA' for California)
    limit?: number; // Number of results to return (default: 50)
    start?: number; // Starting position for pagination
    q?: string; // Search query string
    parkCode?: string; // Specific park code for detailed lookups
  }

  /**
   * Comprehensive representation of a national park.
   * This includes all the data fields that the NPS API might return about a park.
   */
  export interface Park {
    id: string;
    url: string;
    fullName: string;
    parkCode: string;
    description: string;
    latitude: string;
    longitude: string;
    states: string;
    directionsInfo: string;
    directionsUrl: string;
    weatherInfo: string;
    name: string;
    designation: string;
    images: Array<{
      credit: string;
      title: string;
      altText: string;
      caption: string;
      url: string;
    }>;
    addresses: Array<{
      postalCode: string;
      city: string;
      stateCode: string;
      countryCode: string;
      provinceTerritoryCode: string;
      line1: string;
      line2?: string;
      line3?: string;
      type: 'Physical' | 'Mailing';
    }>;
    contacts: {
      phoneNumbers: Array<{
        phoneNumber: string;
        description: string;
        extension: string;
        type: string;
      }>;
      emailAddresses: Array<{
        description: string;
        emailAddress: string;
      }>;
    };
    entranceFees: Array<{
      cost: string;
      description: string;
      title: string;
    }>;
    operatingHours: Array<{
      name: string;
      description: string;
      standardHours: {
        sunday: string;
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
      };
      exceptions: Array<{
        name: string;
        startDate: string;
        endDate: string;
        exceptionHours: {
          sunday: string;
          monday: string;
          tuesday: string;
          wednesday: string;
          thursday: string;
          friday: string;
          saturday: string;
        };
      }>;
    }>;
  }
