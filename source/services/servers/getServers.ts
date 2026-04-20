import { serversTable } from "../../database/schema";
import { copyFileServer } from "./process/copy";
import type { AxiosInstance } from "axios";

import type { Entries } from "./types";
import type { InferSelectModel } from "drizzle-orm";
type Server = InferSelectModel<typeof serversTable>;

export const getServers = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
): Promise<void> => {
  const { data } = await client.get<Entries>(
    `/services/${server.id}/gameservers/file_server/list`,
    {
      params: {
        dir: `${server.path}ShooterGame/Saved/SavedArks`,
      },
    },
  );

  const entries = data.data.entries
    .sort((a, b) => b.modified_at - a.modified_at)
    .filter((entry) => entry.path.endsWith(".ark.gz"))
    .slice(0, 5);

  for (const entry of entries) {
    await copyFileServer(client, server, entry);
  }

  // await copyFileServer(client, server, mapped);

  // console.log(data.data.entries);
  // console.log(Math.floor(Date.now() / 1000));
};
