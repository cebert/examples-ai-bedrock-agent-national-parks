/**
 * National Park Service (NPS) API Client
 *
 * This module provides a type-safe client for interacting with the National Park Service API.
 * It handles authentication, request formatting, and error handling while providing
 * a clean interface for retrieving information about national parks.
 *
 * @example
 * ```typescript
 * import { NPSClient } from './client.js';
 *
 * const client = new NPSClient({
 *   apiKey: process.env.NPS_API_KEY!
 * });
 *
 * // Get parks in California
 * const parks = await client.getParks({ stateCode: 'CA' });
 * ```
 */

export { NPSClient } from './client.js';
export type { NPSClientConfig, NPSResponse, Park, ParkFilters } from './types.js';
export {
  NPSError,
  NPSAuthenticationError,
  NPSRateLimitError,
  NPSNotFoundError,
  NPSValidationError,
} from './errors.js';

/**
 * Default config settings
 */
export const DEFAULT_CONFIG = {
  baseUrl: 'https://developer.nps.gov/api/v1',
  defaultLimit: 50,
  timeout: 30000,
} as const;

/**
 * Constants used throughout the NPS client
 */
export const NPS_CONSTANTS = {
  MAX_LIMIT: 100,
  DEFAULT_TIMEOUT: 30000,
  BASE_URL: 'https://developer.nps.gov/api/v1',
} as const;
