import { db } from '../config/database'
import { lonesModel, NewLone } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createLone = async (data: NewLone) => {
  const result = await db
    .insert(lonesModel)
    .values(data)

  const loneId = Number(result.lastInsertRowid)

  const [lone] = await db
    .select()
    .from(lonesModel)
    .where(eq(lonesModel.loneId, loneId))

  return lone
}

// READ ALL
export const getLones = async () => {
  return await db.select().from(lonesModel)
}

// UPDATE
export const updateLone = async (
  loneId: number,
  loneName: string,
  updatedBy: number
) => {
  await db
    .update(lonesModel)
    .set({ loneName, updatedBy })
    .where(eq(lonesModel.loneId, loneId))

  const [updated] = await db
    .select()
    .from(lonesModel)
    .where(eq(lonesModel.loneId, loneId))

  return updated
}

// DELETE
export const deleteLone = async (loneId: number) => {
  await db.delete(lonesModel).where(eq(lonesModel.loneId, loneId))
}
