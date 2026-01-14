import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull(), // 'pvp' or 'pvc'
  gridSize: integer("grid_size").notNull(),
  player1Score: integer("player1_score").notNull(),
  player2Score: integer("player2_score").notNull(),
  player1Name: text("player1_name").default("P1"),
  player2Name: text("player2_name").default("P2"),
  winner: text("winner"), // 'Player 1', 'Player 2', 'Computer', 'Draw'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({ id: true, createdAt: true });

export type GameResult = typeof gameResults.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
