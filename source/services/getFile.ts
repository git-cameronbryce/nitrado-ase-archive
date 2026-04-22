import { InferSelectModel } from "drizzle-orm";
import { serversTable } from "../database/schema";
type Server = InferSelectModel<typeof serversTable>;

import { AxiosInstance } from "axios";
import { Entries } from "../types";
import { copyEntries } from "./process/copy";
import { downloadEntries } from "./process/download";

export const getFiles = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
) => {
  const dirs = (path: string) => ({
    saves: `${path}ShooterGame/Saved/SavedArks`,
    logs: `${path}ShooterGame/Saved/Logs`,
  });

  await Promise.all(
    Object.entries(dirs(server.path!)).map(async ([type, dir]) => {
      const { data } = await client.get<Entries>(
        `/services/${server.id}/gameservers/file_server/list`,
        {
          params: {
            dir,
          },
        },
      );

      const saves = data.data.entries
        .filter((entry) => entry.name.endsWith(".ark.gz"))
        .sort((a, b) => b.modified_at - a.modified_at)
        .slice(0, 5);

      const logs = data.data.entries
        .filter((entry) => entry.name.startsWith("ShooterGame-backup"))
        .sort((a, b) => b.modified_at - a.modified_at)
        .slice(0, 5);

      const entries = [...saves, ...logs];

      for (const entry of entries) {
        if (entry.path.endsWith(".ark") || entry.path.endsWith(".gz")) {
          await copyEntries(client, server, entry);
          await downloadEntries(client, server, entry);
        }

        return;
        const params = {
          file: entry.path,
        };

        const { data } = await client.get(
          `/services/${server.id}/gameservers/file_server/download`,
          { params },
        );

        await client.post(process.env.WORKER_URL!, {
          url: data.data.token.url,
          key: `logfiles/${server.id}/${entry.name}`,
        });
      }
    }),
  );
};
