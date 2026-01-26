import { db } from '../config/database'
import { employeeTypeModel } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createEmployeeType = async (employeeTypeName: string) => {
  const result = await db.insert(employeeTypeModel).values({ employeeTypeName })

  const employeeTypeId = Number(result.lastInsertRowid)

  const [employeeType] = await db
    .select()
    .from(employeeTypeModel)
    .where(eq(employeeTypeModel.employeeTypeId, employeeTypeId))

  return employeeType
}

// READ ALL
export const getEmployeeTypes = async () => {
  return await db.select().from(employeeTypeModel)
}

// UPDATE
export const updateEmployeeType = async (
  employeeTypeId: number,
  employeeTypeName: string
) => {
  await db
    .update(employeeTypeModel)
    .set({ employeeTypeName })
    .where(eq(employeeTypeModel.employeeTypeId, employeeTypeId))

  const [updated] = await db
    .select()
    .from(employeeTypeModel)
    .where(eq(employeeTypeModel.employeeTypeId, employeeTypeId))

  return updated
}

// DELETE
export const deleteEmployeeType = async (employeeTypeId: number) => {
  await db
    .delete(employeeTypeModel)
    .where(eq(employeeTypeModel.employeeTypeId, employeeTypeId))
}
