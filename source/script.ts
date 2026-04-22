import { db } from "./database/client";
import { eq } from "drizzle-orm";
import axios from "axios";

import Bottleneck from "bottleneck";
import { getFiles } from "./services/getFile";
import { getPlayers } from "./services/players/getPlayers";
import { accountsTable, serversTable } from "./database/schema";

const main = async (): Promise<void> => {
  const accounts = await db.select().from(accountsTable);

  for (const account of accounts) {
    const limiter = new Bottleneck({
      maxConcurrent: 3,
      minTime: 333,
    });

    const client = axios.create({
      baseURL: "https://api.nitrado.net",
      headers: { Authorization: `Bearer ${account.token}` },
    });

    // prettier-ignore
    client.delete = limiter.wrap(client.delete.bind(client)) as typeof client.delete;
    client.post = limiter.wrap(client.post.bind(client)) as typeof client.post;
    client.get = limiter.wrap(client.get.bind(client)) as typeof client.get;

    const servers = await db
      .select()
      .from(serversTable)
      .where(eq(serversTable.guild, account.guild));

    await Promise.all(
      servers.map(async (server) => {
        await getFiles(client, server);
        await getPlayers(client, server);
      }),
    );
  }

  console.log("Data updated successfully");
};

const timer = async () => {
  await main();
  setTimeout(timer, 60000);
};

timer();
