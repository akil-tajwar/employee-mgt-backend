import { db } from '../config/database'
import { departmentModel } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createDepartment = async (departmentName: string, createdBy: number) => {
  const result = await db.insert(departmentModel).values({ departmentName, createdBy })

  const departmentId = Number(result.lastInsertRowid)

  const [department] = await db
    .select()
    .from(departmentModel)
    .where(eq(departmentModel.departmentId, departmentId))

  return department
}

// READ ALL
export const getDepartments = async () => {
  return await db.select().from(departmentModel)
}

// UPDATE
export const updateDepartment = async (
  departmentId: number,
  departmentName: string,
  updatedBy: number
) => {
  await db
    .update(departmentModel)
    .set({ departmentName, updatedBy })
    .where(eq(departmentModel.departmentId, departmentId))

  const [updated] = await db
    .select()
    .from(departmentModel)
    .where(eq(departmentModel.departmentId, departmentId))

  return updated
}

// DELETE
export const deleteDepartment = async (departmentId: number) => {
  await db
    .delete(departmentModel)
    .where(eq(departmentModel.departmentId, departmentId))
}
