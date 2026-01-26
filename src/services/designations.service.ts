import { db } from '../config/database'
import { designationModel } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createDesignation = async (designationName: string) => {
  const result = await db.insert(designationModel).values({ designationName })

  const designationId = Number(result.lastInsertRowid)

  const [designation] = await db
    .select()
    .from(designationModel)
    .where(eq(designationModel.designationId, designationId))

  return designation
}

// READ ALL
export const getDesignations = async () => {
  return await db.select().from(designationModel)
}

// UPDATE
export const updateDesignation = async (
  designationId: number,
  designationName: string
) => {
  await db
    .update(designationModel)
    .set({ designationName })
    .where(eq(designationModel.designationId, designationId))

  const [updated] = await db
    .select()
    .from(designationModel)
    .where(eq(designationModel.designationId, designationId))

  return updated
}

// DELETE
export const deleteDesignation = async (designationId: number) => {
  await db
    .delete(designationModel)
    .where(eq(designationModel.designationId, designationId))
}
