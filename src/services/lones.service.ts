import { db } from '../config/database'
import { departmentModel, designationModel, employeeModel, leaveTypeModel, Lone, lonesModel, NewLone } from '../schemas'
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
  return await db
    .select({
      // Lone fields
      loneId: lonesModel.loneId,
      loneName: lonesModel.loneName,
      loneDate: lonesModel.loneDate,
      employeeId: lonesModel.employeeId,
      createdBy: lonesModel.createdBy,
      createdAt: lonesModel.createdAt,
      updatedBy: lonesModel.updatedBy,
      updatedAt: lonesModel.updatedAt,
      // Employee fields (adjust based on your employeeModel schema)
      empCode: employeeModel.empCode, // example field
      employeeName: employeeModel.fullName, // example field
      designationName: designationModel.designationName, // example field
      departmentName: departmentModel.departmentName, // example field
    })
    .from(lonesModel)
    .leftJoin(employeeModel, eq(lonesModel.employeeId, employeeModel.employeeId))
    .leftJoin(designationModel, eq(employeeModel.designationId, designationModel.designationId))
    .leftJoin(departmentModel, eq(employeeModel.departmentId, departmentModel.departmentId))
};

// UPDATE
export const updateLone = async (
  data: Lone
) => {
  await db
    .update(lonesModel)
    .set({ loneName: data.loneName, updatedBy: data.updatedBy })
    .where(eq(lonesModel.loneId, data.loneId))

  const [updated] = await db
    .select()
    .from(lonesModel)
    .where(eq(lonesModel.loneId, data.loneId))

  return updated
}

// DELETE
export const deleteLone = async (loneId: number) => {
  await db.delete(lonesModel).where(eq(lonesModel.loneId, loneId))
}
