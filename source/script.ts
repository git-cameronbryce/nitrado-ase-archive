import type { ServerInfo } from "./services/global.types";

import { getGamesave } from "./services/gamesave/getGamesave";
import { db } from "./config/firebase";

const main = async (): Promise<void> => {
  const tokenRef = db.collection("accounts");
  const accountsSnapshot = await tokenRef.get();

  await Promise.all(
    accountsSnapshot.docs.map(async (doc) => {
      const serverRef = doc.ref.collection("servers");
      const serversSnapshot = await serverRef.get();

      const { token } = doc.data() as { token: string };

      await Promise.all(
        serversSnapshot.docs.map(async (serverDoc) => {
          const { server_info } = serverDoc.data() as {
            server_info: ServerInfo;
          };

          await getGamesave({ server_info, token });
        }),
      );
    }),
  );
};

main();
