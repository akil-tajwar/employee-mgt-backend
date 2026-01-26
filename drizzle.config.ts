import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const dbPath = process.env.DATABASE_URL!;

export default defineConfig({
  schema: './src/schemas/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: { url: dbPath }
});
