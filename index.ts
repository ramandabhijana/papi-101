import { getWsProvider } from "polkadot-api/ws-provider/web";
import {
  createClient,
  type FixedSizeBinary,
  type PolkadotClient,
  type SS58String,
} from "polkadot-api";
import { dot, people } from "@polkadot-api/descriptors";

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

async function getDisplayName(
  peopleClient: PolkadotClient,
  address: SS58String
): Promise<string | undefined> {
  const peopleApi = peopleClient.getTypedApi(people);
  const accountInfo = await peopleApi.query.Identity.IdentityOf.getValue(
    address
  );
  const displayName = accountInfo?.[0].info.display.value;
  return (displayName as FixedSizeBinary<any>)?.asText();
}

async function main() {
  // Set up clients
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  await printChainInfo(polkadotClient);

  const peopleClient = makeClient("wss://polkadot-people-rpc.polkadot.io");
  await printChainInfo(peopleClient);

  // Chain interactions
  const address = "15DCZocYEM2ThYCAj22QE4QENRvUNVrDtoLBVbCm5x4EQncr";
  const balance = await getBalance(polkadotClient, address);
  const display = await getDisplayName(peopleClient, address);

  console.log(`Balance of account ${address} (${display}) is ${balance}`);
}

main();
