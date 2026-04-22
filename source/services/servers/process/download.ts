import { serversTable } from "../../../database/schema";

import type { AxiosInstance } from "axios";
import type { InferSelectModel } from "drizzle-orm";
import type { Entries } from "../../../types";

type Server = InferSelectModel<typeof serversTable>;
type Entry = Entries["data"]["entries"][number];

export const downloadEntries = async (
  client: AxiosInstance,
  server: Pick<Server, "id">,
  entry: Entry,
) => {
  const target = entry.path.split("SavedArks/").join("");

  const { data } = await client.get(
    `/services/${server.id}/gameservers/file_server/download`,
    {
      params: {
        file: target,
      },
    },
  );

  await client.post(process.env.WORKER_URL!, {
    url: data.data.token.url,
    key: `backups/${server.id}/${entry.name}`,
  });

  await client.delete(`/services/${server.id}/gameservers/file_server/delete`, {
    data: {
      path: target,
    },
  });
};
