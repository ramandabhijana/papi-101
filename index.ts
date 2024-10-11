import { getWsProvider } from "polkadot-api/ws-provider/web";
import {
  createClient,
  type FixedSizeBinary,
  type PolkadotClient,
  type SS58String,
} from "polkadot-api";
import { collectives, dot, people } from "@polkadot-api/descriptors";

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

interface FellowshipMember {
  address: SS58String;
  rank: number;
}
async function getFellowshipMembers(
  collectivesClient: PolkadotClient
): Promise<FellowshipMember[]> {
  const collectivesApi = collectivesClient.getTypedApi(collectives);

  const rawMembers =
    await collectivesApi.query.FellowshipCollective.Members.getEntries();

  const fellowshipMembers = rawMembers.map((m) => {
    const member: FellowshipMember = {
      address: m.keyArgs[0],
      rank: m.value,
    };
    return member;
  });

  return fellowshipMembers;
}

async function main() {
  // Set up clients
  const polkadotClient = makeClient("wss://rpc.polkadot.io");
  await printChainInfo(polkadotClient);

  const peopleClient = makeClient("wss://polkadot-people-rpc.polkadot.io");
  await printChainInfo(peopleClient);

  const collectivesClient = makeClient(
    "wss://polkadot-collectives-rpc.polkadot.io"
  );
  await printChainInfo(collectivesClient);

  // Chain interactions
  const members = await getFellowshipMembers(collectivesClient);

  let table = [];

  for (const member of members) {
    const { address } = member;

    const balance = await getBalance(polkadotClient, address);
    const display = await getDisplayName(peopleClient, address);

    table.push({ ...member, display, balance });
  }

  table.sort((a, b) => b.rank - a.rank);

  console.table(table);
}

main();
