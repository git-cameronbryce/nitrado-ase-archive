import { downloadFileServer } from "./process/download";
import { copyFileServer } from "./process/copy";
import { serversTable } from "../../database/schema";

import type { Entries } from "./types";
import type { AxiosInstance } from "axios";
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
    .filter((entry) => entry.name.endsWith(".ark.gz"))
    .slice(0, 5);

  await Promise.all(
    entries.map(async (entry) => {
      await copyFileServer(client, server, entry);
      await downloadFileServer(client, server, entry);
    }),
  );
};
