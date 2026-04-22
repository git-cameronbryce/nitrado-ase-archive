import { downloadFileLogs } from "./process/download";
import { serversTable } from "../../database/schema";

import type { Entries } from "../../types";
import type { AxiosInstance } from "axios";
import type { InferSelectModel } from "drizzle-orm";
type Server = InferSelectModel<typeof serversTable>;

export const getLogs = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
): Promise<void> => {
  const { data } = await client.get<Entries>(
    `/services/${server.id}/gameservers/file_server/list`,
    {
      params: {
        dir: `${server.path}ShooterGame/Saved/Logs`,
      },
    },
  );

  const entries = data.data.entries
    .sort((a, b) => b.modified_at - a.modified_at)
    .filter((entry) => entry.name.startsWith("ShooterGame-backup"))
    .slice(0, 5);

  await Promise.all(
    entries.map(async (entry) => {
      await downloadFileLogs(client, server, entry);
    }),
  );
};
