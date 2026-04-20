import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";

export const accountsTable = pgTable("accounts", {
  guild: text().primaryKey().notNull(),
  token: text().notNull(),
});

export const serversTable = pgTable("servers", {
  guild: text().references(() => accountsTable.guild),
  id: integer().primaryKey().notNull(),

  path: text(),
  status: text(),
  serverName: text(),
  maximumPlayers: integer(),
  currentPlayers: integer(),
});

export const playersTable = pgTable("players", {
  serverId: integer().references(() => serversTable.id),
  uuid: text().primaryKey(),

  name: text(),
  isOnline: boolean(),
  lastOnline: text(),
});
