import { backendUrl } from "../config";

interface TokenConfig {
  bridges: {
    [key: string]: {
      [network: string]: string;
      side: string;
    };
  };
  tokens: {
    [symbol: string]: {
      isActive: boolean;
      name: string;
      symbol: string;
      denomination: number;
      decimals: {
        [network: string]: number;
      };
      logo: string;
      primaryNets: string[];
      addresses: {
        [network: string]: string;
      };
      nativeAnalog: string;
    };
  };
}

/**
 * Fetches the tokens configuration from the backend API.
 *
 * @returns {Promise<TokenConfig>} Promise that resolves to the tokens configuration object containing details about bridges and tokens.
 *
 * @throws Will throw an error if the fetch request fails or the response is invalid.
 */

export async function getTokensConfig(): Promise<TokenConfig> {
  const tokensConfigUrl: URL = URL.parse("/api/tokens", backendUrl)!;
  const response = await fetch(tokensConfigUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get tokens config: ${
        response.status
      }, ${JSON.stringify(await response.json())}`,
    );
  }
  const data = await response.json();
  return data as TokenConfig;
}
