import { db } from "./database/client";
import { eq } from "drizzle-orm";

import { accountsTable, playersTable, serversTable } from "./database/schema";

const main = async (): Promise<void> => {
  const accounts = await db.select().from(accountsTable);

  for (const account of accounts) {
    const servers = await db
      .select()
      .from(serversTable)
      .where(eq(serversTable.guild, account.guild));

    console.log(servers);

    for (const server of servers) {
      const players = await db
        .select()
        .from(playersTable)
        .where(eq(playersTable.serverId, server.id));

      console.log(players);
    }
  }
};

main();
