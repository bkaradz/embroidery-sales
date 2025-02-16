import type { Database } from 'better-sqlite3';
import { getTableName, sql } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export const resetSqliteDatabase = async (db: BetterSQLite3Database<typeof import("$lib/server/db/schema/schema")> & { $client: Database; }, schema: { [s: string]: unknown; } | ArrayLike<unknown>) => {
  const tablesToTruncate = Object.values(schema).map((table) => {
    const dbTableName = getTableName(table as any);
    return dbTableName;
  }).filter((name) => name !== undefined);

  db.run(sql.raw('PRAGMA foreign_keys = OFF'));
  for (const tableName of tablesToTruncate) {
    const sqlQueryDelete = `delete from \`${tableName}\`;`;
    db.run(sql.raw(sqlQueryDelete));
  }
  const sqlQueryResetId = `delete from sqlite_sequence;`;
  db.run(sql.raw(sqlQueryResetId));
  db.run(sql.raw('PRAGMA foreign_keys = ON'));
};
