import { serversTable } from "../../../database/schema";

import type { InferSelectModel } from "drizzle-orm";
import type { AxiosInstance } from "axios";
import type { Entries } from "../../../types";

type Server = InferSelectModel<typeof serversTable>;
type Entry = Entries["data"]["entries"][number];

export const copyFileServer = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
  entry: Entry,
): Promise<void> => {
  const [target, file] = entry.path.split("SavedArks/");
  console.log(target, file);

  const { data } = await client.post(
    `/services/${server.id}/gameservers/file_server/copy`,
    {
      source_path: entry.path,
      target_path: target,
      target_name: file,
    },
  );

  console.log(data);
};
