import { serversTable } from "../../../database/schema";

import type { InferSelectModel } from "drizzle-orm";
import type { AxiosInstance } from "axios";
import type { Entries } from "../types";

type Server = InferSelectModel<typeof serversTable>;
type Entry = Entries["data"]["entries"][number];

export const downloadFileServer = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
  entry: Entry,
): Promise<void> => {
  const [target, file] = entry.path.split("SavedArks/");

  const { data } = await client.get(
    `/services/${server.id}/gameservers/file_server/download`,
    {
      params: {
        file: target + file,
      },
    },
  );

  await client.post(process.env.WORKER_URL!, {
    url: data.data.token.url,
    key: `savegame/backups/${server.id}/${file}`,
  });

  await client.delete(`/services/${server.id}/gameservers/file_server/delete`, {
    data: {
      path: target + file,
    },
  });
};
