import { getWsProvider } from "polkadot-api/ws-provider/web";
import { createClient, type PolkadotClient } from "polkadot-api";

function makeClient(endpoint: string): PolkadotClient {
  console.info("Connecting to ", endpoint);
  const provider = getWsProvider(endpoint);
  const client = createClient(provider);
  return client;
}

async function printChainInfo(client: PolkadotClient) {
  // DO NOT use `getChainSpecData` in production apps
  const chainSpec = await client.getChainSpecData();

  const finalizedBlock = await client.getFinalizedBlock();

  console.info(
    "Chain: ",
    chainSpec.name,
    "\nLatest finalized block: ",
    finalizedBlock
  );
}

async function main() {
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  await printChainInfo(polkadotClient);
}

main();
