import { InferSelectModel } from "drizzle-orm";
import { serversTable } from "../database/schema";
type Server = InferSelectModel<typeof serversTable>;

import { AxiosInstance } from "axios";
import { Entries } from "../types";

export const getFiles = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
) => {
  console.log(server.path);

  const dirs = (path: string) => ({
    saves: `${path}ShooterGame/Saved/SavedArks`,
    logs: `${path}ShooterGame/Saved/Logs`,
  });

  await Promise.all(
    Object.entries(dirs(server.path!)).map(async ([type, dir]) => {
      console.log(type, dir);

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

      console.log(type, entries);
    }),
  );
};
