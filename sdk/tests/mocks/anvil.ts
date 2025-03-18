export async function waitForAnvil(retries = 0) {
  try {
    const url = `http://127.0.0.1:8545`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    return response.ok && (await response.json()) !== undefined;
  } catch {
    console.log("Anvil is not ready yet");
    if (retries > 10) {
      throw new Error("Anvil is not ready");
    } else {
      return await new Promise((resolve) => {
        setTimeout(() => resolve(waitForAnvil(retries++)), 1000);
      });
    }
  }
}
