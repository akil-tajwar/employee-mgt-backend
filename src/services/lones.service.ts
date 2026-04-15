import { db } from '../config/database'
import { departmentModel, designationModel, employeeModel, employeeOtherSalaryComponentsModel, leaveTypeModel, Lone, lonesModel, NewLone } from '../schemas'
import { eq } from 'drizzle-orm'
import { BadRequestError } from './utils/errors.utils'

// CREATE
export const createLone = async (data: NewLone) => {
  // Fetch employee's basic salary
  const [employee] = await db
    .select()
    .from(employeeModel)
    .where(eq(employeeModel.employeeId, data.employeeId))
    .limit(1)

  if (!employee) {
    throw BadRequestError('Employee not found')
  }

  // Validate that lone amount is less than or equal to basic salary
  if (data.amount > employee.basicSalary) {
    throw BadRequestError(
      `Lone amount (${data.amount}) cannot exceed employee's basic salary (${employee.basicSalary})`
    )
  }

  const now = Date.now()

  // Insert into lones table
  const result = await db
    .insert(lonesModel)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })

  const loneId = Number(result.lastInsertRowid)

  // Parse loan date to get month and year
  const loneDate = new Date(data.loneDate)
  const salaryMonth = loneDate.toLocaleString('default', {
    month: 'long',
  })
  const salaryYear = loneDate.getFullYear()

  // Insert into employeeOtherSalaryComponents table
  await db.insert(employeeOtherSalaryComponentsModel).values({
    employeeId: data.employeeId,
    otherSalaryComponentId: 6, // Lone component ID
    salaryMonth: salaryMonth,
    salaryYear: salaryYear,
    amount: data.amount,
    isAuthorized: 1, // Always authorized for lone
    createdBy: data.createdBy,
    createdAt: now,
  })

  // Fetch and return the created lone
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
