import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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

  gamertag: text().unique(),
  isOnline: boolean(),
  lastOnline: text(),
});

export const profilesTable = pgTable("profiles", {
  xuid: text().primaryKey(),
  serverId: integer().references(() => serversTable.id),
  gamertag: text(),

  level: integer(),
  characterName: text(),
  networkAddress: text(),
  updatedAt: timestamp().defaultNow(),
});
