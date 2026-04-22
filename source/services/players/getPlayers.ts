import { downloadFilePlayer } from "./process/download";
import { copyFilePlayer } from "./process/copy";

import { serversTable } from "../../database/schema";

import type { Entries } from "../../types";
import type { AxiosInstance } from "axios";
import type { InferSelectModel } from "drizzle-orm";

type Server = InferSelectModel<typeof serversTable>;

export const getPlayers = async (
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

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

  const entries = data.data.entries
    .filter((entry) => entry.name.endsWith(".arkprofile"))
    .filter((entry) => entry.modified_at >= thirtyDaysAgo);

  await Promise.all(
    entries.map(async (entry) => {
      await copyFilePlayer(client, server, entry);
      await downloadFilePlayer(client, server, entry);
    }),
  );
};
