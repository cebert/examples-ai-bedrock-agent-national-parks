import {
    NPSError,
    NPSAuthenticationError,
    NPSRateLimitError,
    NPSNotFoundError,
    NPSValidationError,
  } from './errors.js';

  import type { NPSClientConfig, NPSResponse, Park, ParkFilters } from './types.js';

  /**
   * Interface defining the structure of error responses from the NPS API
   */
  interface NPSErrorResponse {
    error?: string;
    message?: string;
    status?: number;
  }

  /**
   * Client for interacting with the National Park Service API.
   */
  export class NPSClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly defaultLimit: number;
    private readonly timeout: number;

    constructor(config: NPSClientConfig) {
      if (!config.apiKey) {
        throw new NPSAuthenticationError('API key is required to initialize the NPS client');
      }

      this.apiKey = config.apiKey;
      this.baseUrl = config.baseUrl || 'https://developer.nps.gov/api/v1';
      this.defaultLimit = typeof config.defaultLimit === 'number' ? config.defaultLimit : 50;
      this.timeout = typeof config.timeout === 'number' ? config.timeout : 30000;
    }

    /**
     * Retrieves a list of national parks with optional filtering.
     * @param filters Optional parameters to filter the parks results
     * @returns A promise resolving to the parks response
     * @throws {NPSError} When the API request fails
     */
    async getParks(filters: ParkFilters = {}): Promise<NPSResponse<Park>> {
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        limit: (filters.limit || this.defaultLimit).toString(),
        start: (filters.start || 0).toString(),
      });

      if (filters.stateCode) {
        queryParams.append('stateCode', filters.stateCode.toUpperCase());
      }

      if (filters.q) {
        queryParams.append('q', filters.q);
      }

      if (filters.parkCode) {
        queryParams.append('parkCode', filters.parkCode.toLowerCase());
      }

      return this.makeRequest<Park>('/parks', queryParams);
    }

    /**
     * Retrieves detailed information about a specific park by its code.
     * @param parkCode The unique identifier for the park
     * @returns A promise resolving to the park details
     * @throws {NPSValidationError} When no park code is provided
     * @throws {NPSNotFoundError} When the park code doesn't exist
     */
    async getPark(parkCode: string): Promise<Park> {
      if (!parkCode) {
        throw new NPSValidationError('Park code is required');
      }

      const response = await this.getParks({ parkCode: parkCode.toLowerCase() });

      if (response.data.length === 0) {
        throw new NPSNotFoundError(`park with code ${parkCode}`);
      }

      return response.data[0];
    }

    /**
     * Makes a request to the NPS API
     * @param endpoint The API endpoint to call
     * @param params Query parameters to include in the request
     * @returns A promise resolving to the API response
     * @throws {NPSError} When the API request fails
     */
    private async makeRequest<T>(endpoint: string, params: URLSearchParams): Promise<NPSResponse<T>> {
      const url = `${this.baseUrl}${endpoint}?${params}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = 'Unknown error occurred';

          try {
            const errorData = (await response.json()) as NPSErrorResponse;
            errorMessage = errorData.message || errorData.error || response.statusText;
          } catch {
            errorMessage = response.statusText;
          }

          switch (response.status) {
            case 401:
              throw new NPSAuthenticationError(errorMessage);
            case 404:
              throw new NPSNotFoundError(endpoint);
            case 429:
              throw new NPSRateLimitError(errorMessage);
            default:
              throw new NPSError(errorMessage, response.status, endpoint);
          }
        }

        const data = await response.json();
        return this.validateResponse<T>(data);
      } catch (error) {
        if (error instanceof NPSError) {
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new NPSError(`Request timeout after ${this.timeout}ms`, 408, endpoint);
          }
          throw new NPSError(`Network error: ${error.message}`, 500, endpoint);
        }

        throw new NPSError('Unknown error occurred', 500, endpoint);
      }
    }

    /**
     * Validates that the API response matches our expected structure.
     * @param response The raw response data from the API
     * @returns The validated response data
     * @throws {NPSError} When the response format is invalid
     */
    private validateResponse<T>(response: unknown): NPSResponse<T> {
      if (
        response &&
        typeof response === 'object' &&
        Array.isArray((response as NPSResponse<T>).data) &&
        typeof (response as NPSResponse<T>).total === 'string' &&
        typeof (response as NPSResponse<T>).limit === 'string' &&
        typeof (response as NPSResponse<T>).start === 'string'
      ) {
        return response as NPSResponse<T>;
      }

      throw new NPSError('Invalid response format', 500);
    }

    /**
     * Helper method to format park codes consistently.
     * @param parkCode The park code to format
     * @returns The formatted park code
     */
    private formatParkCode(parkCode: string): string {
      return parkCode.toLowerCase().trim();
    }

    /**
     * Helper method to build complete park URLs.
     * @param parkCode The park's unique identifier
     * @returns The full URL to the park's page on nps.gov
     */
    public getParkUrl(parkCode: string): string {
      return `https://www.nps.gov/${this.formatParkCode(parkCode)}/index.htm`;
    }
  }
