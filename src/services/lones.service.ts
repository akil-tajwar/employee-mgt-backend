import { db } from '../config/database'
import {
  departmentModel,
  designationModel,
  employeeModel,
  employeeOtherSalaryComponentsModel,
  leaveTypeModel,
  Lone,
  employeeLoneModel,
  NewLone,
} from '../schemas'
import { eq } from 'drizzle-orm'
import { BadRequestError } from './utils/errors.utils'

// CREATE
export const createLone = async (data: NewLone) => {
  // Fetch employee's basic salary
  console.log('🚀 ~ createLone ~ data:', data)
  console.log('Employee model table name:', employeeModel);
// This will show you what table name Drizzle is actually using
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
  const result = await db.insert(employeeLoneModel).values({
    ...data,
    createdAt: now,
    updatedAt: now,
  })

  const employeeLoneId = Number(result.lastInsertRowid)

  // Parse loan date to get month and year
  const loneDate = new Date(data.loneDate)

  // Calculate next month
  const nextMonthDate = new Date(loneDate)
  nextMonthDate.setMonth(loneDate.getMonth() + 1)

  const salaryMonth = nextMonthDate.toLocaleString('default', {
    month: 'long',
  })
  const salaryYear = nextMonthDate.getFullYear()

  // Insert into employeeOtherSalaryComponents table
  await db.insert(employeeOtherSalaryComponentsModel).values({
    employeeId: data.employeeId,
    otherSalaryComponentId: 6,
    salaryMonth: salaryMonth,
    salaryYear: salaryYear,
    amount: data.amount,
    isAuthorized: 0,
    createdBy: data.createdBy,
    createdAt: now,
  })

  // Fetch and return the created lone
  const [lone] = await db
    .select()
    .from(employeeLoneModel)
    .where(eq(employeeLoneModel.employeeLoneId, employeeLoneId))

  return lone
}

// READ ALL
export const getLones = async () => {
  return await db
    .select({
      // Lone fields
      employeeLoneId: employeeLoneModel.employeeLoneId,
      employeeLoneName: employeeLoneModel.employeeLoneName,
      loneDate: employeeLoneModel.loneDate,
      employeeId: employeeLoneModel.employeeId,
      createdBy: employeeLoneModel.createdBy,
      createdAt: employeeLoneModel.createdAt,
      updatedBy: employeeLoneModel.updatedBy,
      updatedAt: employeeLoneModel.updatedAt,
      // Employee fields (adjust based on your employeeModel schema)
      empCode: employeeModel.empCode, // example field
      employeeName: employeeModel.fullName, // example field
      designationName: designationModel.designationName, // example field
      departmentName: departmentModel.departmentName, // example field
    })
    .from(employeeLoneModel)
    .leftJoin(
      employeeModel,
      eq(employeeLoneModel.employeeId, employeeModel.employeeId)
    )
    .leftJoin(
      designationModel,
      eq(employeeModel.designationId, designationModel.designationId)
    )
    .leftJoin(
      departmentModel,
      eq(employeeModel.departmentId, departmentModel.departmentId)
    )
}

// UPDATE
export const updateLone = async (data: Lone) => {
  await db
    .update(employeeLoneModel)
    .set({ employeeLoneName: data.employeeLoneName, updatedBy: data.updatedBy })
    .where(eq(employeeLoneModel.employeeLoneId, data.employeeLoneId))

  const [updated] = await db
    .select()
    .from(employeeLoneModel)
    .where(eq(employeeLoneModel.employeeLoneId, data.employeeLoneId))

  return updated
}

// DELETE
export const deleteLone = async (employeeLoneId: number) => {
  await db
    .delete(employeeLoneModel)
    .where(eq(employeeLoneModel.employeeLoneId, employeeLoneId))
}
