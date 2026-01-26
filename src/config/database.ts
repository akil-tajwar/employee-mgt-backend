// src/config/database.ts
const Database = require('better-sqlite3');

import { drizzle } from 'drizzle-orm/better-sqlite3'
import 'dotenv/config'

import * as schema from '../schemas'
import path from 'path';

// Get SQLite file path from env
const dbPath = path.isAbsolute(process.env.DATABASE_URL!)
  ? process.env.DATABASE_URL!
  : path.join(process.cwd(), process.env.DATABASE_URL!);

// Create SQLite connection
const sqlite = new Database(dbPath)

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

// Test DB connection
export function testDatabaseConnection(): void {
  try {
    const result = sqlite.prepare('SELECT 1').get()
    console.log('✅ SQLite database connected:', result)
  } catch (err) {
    console.error('❌ SQLite connection failed:', err)
    throw err
  }
}
