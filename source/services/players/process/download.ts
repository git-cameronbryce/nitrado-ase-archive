import { profilesTable, serversTable } from "../../../database/schema";
import { parse } from "./parse";
import { db } from "../../../database/client";

import type { InferSelectModel } from "drizzle-orm";
import type { AxiosInstance } from "axios";
import type { Entries } from "../../../types";

type Server = InferSelectModel<typeof serversTable>;
type Entry = Entries["data"]["entries"][number];

export const downloadFilePlayer = async (
  client: AxiosInstance,
  server: Pick<Server, "id" | "path">,
  entry: Entry,
): Promise<void> => {
  const [target, file] = entry.path.split("SavedArks/");
  const [uuid] = file.split(".");

  const { data } = await client.get(
    `/services/${server.id}/gameservers/file_server/download`,
    {
      params: {
        file: target + file,
      },
    },
  );

  const binary = await client.get(data.data.token.url, {
    responseType: "arraybuffer",
  });

  const profile = parse(Buffer.from(binary.data), uuid);

  await db
    .insert(profilesTable)
    .values({
      xuid: profile.platformId,
      serverId: server.id,
      gamertag: profile.playerName,
      characterName: profile.characterName,
      level: profile.level,
      networkAddress: profile.lastIp,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profilesTable.xuid,
      set: {
        gamertag: profile.playerName,
        characterName: profile.characterName,
        level: profile.level,
        networkAddress: profile.lastIp,
        updatedAt: new Date(),
      },
    });
};
