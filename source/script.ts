import { db } from "./database/client";
import { eq } from "drizzle-orm";
import axios from "axios";

import { accountsTable, playersTable, serversTable } from "./database/schema";
import { getServers } from "./services/servers/getServers";

const main = async (): Promise<void> => {
  const accounts = await db.select().from(accountsTable);

  for (const account of accounts) {
    const servers = await db
      .select()
      .from(serversTable)
      .where(eq(serversTable.guild, account.guild));

    await Promise.all(
      servers.map(async (server) => {
        const client = axios.create({
          baseURL: "https://api.nitrado.net",
          headers: { Authorization: `Bearer ${account.token}` },
        });

        await getServers(client, server);
      }),
    );
  }
};

main();
