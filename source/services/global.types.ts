interface ServerInfo {
  game_specific: { path: string };
  server_id: number;
  status: string;
}

interface Context {
  server_info: ServerInfo;
  token: string;
}

export type { Context, ServerInfo };
