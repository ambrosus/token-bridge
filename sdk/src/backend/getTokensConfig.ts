import { backendUrl } from "../config";

export async function getTokensConfig() {
  const tokensConfigUrl: URL = URL.parse("/api/tokens", backendUrl)!;
  const response = await fetch(tokensConfigUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to get tokens config: ${
        response.statusText
      }, ${await response.json()}`
    );
  }
  const data = await response.json();
  return data as {
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
  };
}
