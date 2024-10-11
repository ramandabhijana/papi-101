import { getWsProvider } from "polkadot-api/ws-provider/web";
import {
  createClient,
  type PolkadotClient,
  type SS58String,
} from "polkadot-api";
import { dot } from "@polkadot-api/descriptors";

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

async function getBalance(
  polkadotClient: PolkadotClient,
  address: SS58String
): Promise<BigInt> {
  const dotApi = polkadotClient.getTypedApi(dot);
  const accountInfo = await dotApi.query.System.Account.getValue(address);
  const { free, reserved } = accountInfo.data;
  return free + reserved;
}

async function main() {
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  await printChainInfo(polkadotClient);

  const address = "15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr";
  const balance = await getBalance(polkadotClient, address);
  console.log(`Balance of account ${address} is ${balance}`);
}

main();
