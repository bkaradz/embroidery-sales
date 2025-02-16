import { db } from "../db"
import { journalEntries, type NewJournalEntries } from "../db/schema/schema"

export const createJournalEntries = async (journalEntriesData: NewJournalEntries[]) => {

  return await db.insert(journalEntries).values(journalEntriesData).returning()

}