# National Parks Service API Client

## Overview

This TypeScript client for the National Parks Service API was generated using Anthropic's Claude and reviewed by me. I did not create it manually. It provides a type-safe interface for interacting with the [NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm).

This client:

- Handles authentication with API keys
- Provides strong TypeScript types for responses
- Implements error handling with custom error types
- Supports filtering and search functionality
- Includes proper request timeouts and validation

## Usage Example

```typescript
const client = new NPSClient({
   apiKey: process.env.NPS_API_KEY!,
});

// Get parks in California
const parks = await client.getParks({ stateCode: 'CA' });
```

## Disclaimer

This client was AI-generated as part of a demo project showcasing the use of AWS Bedrock Agents with Lambda functions. While it has been reviewed and works sufficiently well for a demo, it is likely not production ready.

## Error Handling

The client includes several custom error types:

- `NPSError` - Base error class
- `NPSAuthenticationError` - API key issues
- `NPSRateLimitError` - Rate limit exceeded
- `NPSNotFoundError` - Resource not found
- `NPSValidationError` - Invalid request parameters

## Configuration

The client accepts several configuration options:

```typescript
interface NPSClientConfig {
   apiKey: string; // Required
   baseUrl?: string; // Optional, defaults to NPS API v1
   defaultLimit?: number; // Optional, defaults to 50
   timeout?: number; // Optional, defaults to 30000ms
}
```

## Note

Do not commit API keys to source control. Use environment variables or secure secret management services to handle API keys.
