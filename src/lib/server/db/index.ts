import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import * as schema from './schema/schema';
import { logger } from '$lib/utility/logger';

dotenv.config();

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const sqlite = new Database(process.env.DATABASE_URL);
// enable WAL mode
sqlite.pragma("journal_mode = WAL");
logger.info(sqlite.pragma('cache_size', { simple: true }))
sqlite.pragma('temp_store = 2')
sqlite.pragma('synchronous = 1')
sqlite.pragma('cache_size = -64000')
logger.info(sqlite.pragma('cache_size', { simple: true }))

/**
 * The docs are wrong there, for SQLite you have run, get, values and all
 * 
 *  run:    For queries where you don't expect results (e.g., inserts, updates, deletes).
 * 
 *  get:    When you only need one record.
 * 
 *  values: For scalar results or single-column queries (e.g., lists of IDs, names).
 * 
 *  all:    For fetching full datasets or structured objects.
 */

// // enable spellfix
// sqlite.loadExtension('./src/lib/server/db/extensions/spellfix.so');

// // Create a virtual table for FTS5
// const statement = `
//   CREATE VIRTUAL TABLE IF NOT EXISTS customers_fts USING FTS5 (
//     id,
//     isDeleted,
//     full_name,
//     is_corporate,
//     notes,
//     phone,
//     email,
//     address,
//     created_at,
//     updated_at,
//   )
// `;

// // Create a trigger to keep FTS5 in sync with the main customers table
// const triggerStatement = `
//   CREATE TRIGGER IF NOT EXISTS customers_ai AFTER INSERT ON customers BEGIN
//     INSERT INTO customers_fts(id, full_name, phone, email, is_corporate) 
//     VALUES (new.id, new.full_name, new.phone, new.email, new.is_corporate);
//   END;

//   CREATE TRIGGER IF NOT EXISTS customers_ad AFTER DELETE ON customers BEGIN
//     DELETE FROM customers_fts WHERE id = old.id;
//   END;

//   CREATE TRIGGER IF NOT EXISTS customers_au AFTER UPDATE ON customers BEGIN
//     UPDATE customers_fts 
//     SET full_name = new.full_name, 
//         phone = new.phone, 
//         email = new.email, 
//         is_corporate = new.is_corporate 
//     WHERE id = old.id;
//   END;
// `;

// sqlite.exec(statement);
// sqlite.exec(triggerStatement);

// // Create a spellfix virtual table
// const spellfixStatement = `
//   CREATE VIRTUAL TABLE IF NOT EXISTS customers_spellfix USING spellfix1;
// `;

// sqlite.exec(spellfixStatement);

// // Insert some words into the spellfix dictionary (replace with your actual words)
// const spellfixInsertStatement = `
//   INSERT INTO customers_spellfix(word) SELECT DISTINCT full_name FROM customers;
// `;

// sqlite.exec(spellfixInsertStatement);

// // Create a trigger to keep spellfix in sync with the main customers table
// const spellfixTriggerStatement = `
//   CREATE TRIGGER IF NOT EXISTS customers_spellfix_ai 
//   AFTER INSERT ON customers 
//   BEGIN
//     INSERT INTO customers_spellfix(word) 
//     VALUES (new.full_name);
//   END;

//   CREATE TRIGGER IF NOT EXISTS customers_spellfix_ad 
//   AFTER DELETE ON customers 
//   BEGIN
//     DELETE FROM customers_spellfix 
//     WHERE word = old.full_name;
//   END;

//   CREATE TRIGGER IF NOT EXISTS customers_spellfix_au 
//   AFTER UPDATE OF full_name ON customers 
//   BEGIN
//     DELETE FROM customers_spellfix 
//     WHERE word = old.full_name;

//     INSERT INTO customers_spellfix(word) 
//     VALUES (new.full_name);
//   END;
// `;

// sqlite.exec(spellfixTriggerStatement);

export const db = drizzle(sqlite, { schema });
