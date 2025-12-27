import { gameResults, type GameResult, type InsertGameResult } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  getGameResults(): Promise<GameResult[]>;
  createGameResult(result: InsertGameResult): Promise<GameResult>;
}

export class DatabaseStorage implements IStorage {
  async getGameResults(): Promise<GameResult[]> {
    return await db.select().from(gameResults).orderBy(desc(gameResults.createdAt)).limit(50);
  }

  async createGameResult(result: InsertGameResult): Promise<GameResult> {
    const [newResult] = await db.insert(gameResults).values(result).returning();
    return newResult;
  }
}

export const storage = new DatabaseStorage();
