import { db } from '../config/database'
import {
  departmentModel,
  designationModel,
  employeeModel,
  employeeOtherSalaryComponentsModel,
  Lone,
  employeeLoneModel,
  NewLone,
  otherSalaryComponentsModel,
} from '../schemas'
import { eq } from 'drizzle-orm'
import { BadRequestError } from './utils/errors.utils'

// CREATE
export const createLone = async (data: NewLone) => {
  console.log('🚀 ~ createLone ~ data:', data)

  const [employee] = await db
    .select()
    .from(employeeModel)
    .where(eq(employeeModel.employeeId, data.employeeId))
    .limit(1)

  if (!employee) {
    throw BadRequestError('Employee not found')
  }

  if (data.amount > employee.basicSalary) {
    throw BadRequestError(
      `Lone amount (${data.amount}) cannot exceed employee's basic salary (${employee.basicSalary})`
    )
  }

  // Fetch lone salary component where isLoneFee = 1 (or true)
  const [loneSalaryComponent] = await db
    .select()
    .from(otherSalaryComponentsModel)
    .where(eq(otherSalaryComponentsModel.isLoneFee, 1))
    .limit(1)

  if (!loneSalaryComponent) {
    throw BadRequestError(
      'Lone salary component not configured. Please contact administrator.'
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

  // ---- INSTALLMENT LOGIC START ----
  let remainingAmount = data.amount
  const perMonth = data.perMonth

  if (!perMonth || perMonth <= 0) {
    throw BadRequestError('perMonth must be greater than 0')
  }

  const loneDate = new Date(data.loneDate)

  // Start from next month
  let currentDate = new Date(loneDate)
  currentDate.setMonth(currentDate.getMonth() + 1)

  const insertPayload: any[] = []

  while (remainingAmount > 0) {
    const deductionAmount =
      remainingAmount >= perMonth ? perMonth : remainingAmount

    const salaryMonth = currentDate.toLocaleString('default', {
      month: 'long',
    })
    const salaryYear = currentDate.getFullYear()

    insertPayload.push({
      employeeId: data.employeeId,
      otherSalaryComponentId: loneSalaryComponent.otherSalaryComponentId, // Dynamic ID from where isLoneFee = 1
      salaryMonth,
      salaryYear,
      amount: deductionAmount,
      isAuthorized: 1,
      createdBy: data.createdBy,
      createdAt: now,
    })

    remainingAmount -= deductionAmount

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Bulk insert all months
  if (insertPayload.length > 0) {
    await db.insert(employeeOtherSalaryComponentsModel).values(insertPayload)
  }

  // ---- INSTALLMENT LOGIC END ----
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
      amount: employeeLoneModel.amount,
      perMonth: employeeLoneModel.perMonth,
      description: employeeLoneModel.description,
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
