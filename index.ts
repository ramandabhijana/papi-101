import { getWsProvider } from "polkadot-api/ws-provider/web";
import { createClient, type PolkadotClient } from "polkadot-api";

function makeClient(endpoint: string): PolkadotClient {
  console.info("Connecting to ", endpoint);
  const provider = getWsProvider(endpoint);
  const client = createClient(provider);
  return client;
}

async function main() {
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  console.log({ polkadotClient });
}

main();
