import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  employeeModel,
  employeeOtherSalaryComponentsModel,
  NewEmployeeOtherSalaryComponent,
  otherSalaryComponentsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createEmployeeOtherSalaryComponent = async (
  data: Omit<
    NewEmployeeOtherSalaryComponent,
    'employeeOtherSalaryComponentId' | 'updatedAt' | 'updatedBy'
  >[]
) => {
  try {
    const now = Date.now()

    const values = data.map((item) => ({
      ...item,
      createdAt: now,
    }))

    await db.insert(employeeOtherSalaryComponentsModel).values(values)

    return {
      insertedCount: values.length,
      data: values,
    }
  } catch (error) {
    throw error
  }
}

// Update
export const editEmployeeOtherSalaryComponent = async (
  employeeOtherSalaryComponentId: number,
  employeeOtherSalaryComponentData: Partial<NewEmployeeOtherSalaryComponent>
) => {
  const [updatedEmployeeOtherSalaryComponent] = await db
    .update(employeeOtherSalaryComponentsModel)
    .set(employeeOtherSalaryComponentData)
    .where(
      eq(
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
        employeeOtherSalaryComponentId
      )
    )

  if (!updatedEmployeeOtherSalaryComponent) {
    throw BadRequestError('Cloth employeeOtherSalaryComponent not found')
  }

  return updatedEmployeeOtherSalaryComponent
}

// Get All
export const getAllEmployeeOtherSalaryComponents = async () => {
  return await db
    .select({
      employeeOtherSalaryComponentId:
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,

      // Employee fields
      employeeId: employeeModel.employeeId,
      employeeName: employeeModel.fullName, // adjust column name

      // Other salary component fields
      otherSalaryComponentId: otherSalaryComponentsModel.otherSalaryComponentId,
      componentName: otherSalaryComponentsModel.componentName, // adjust

      // Salary data
      salaryMonth: employeeOtherSalaryComponentsModel.salaryMonth,
      salaryYear: employeeOtherSalaryComponentsModel.salaryYear,
      amount: employeeOtherSalaryComponentsModel.amount,

      createdAt: employeeOtherSalaryComponentsModel.createdAt,
    })
    .from(employeeOtherSalaryComponentsModel)
    .leftJoin(
      employeeModel,
      eq(
        employeeOtherSalaryComponentsModel.employeeId,
        employeeModel.employeeId
      )
    )
    .leftJoin(
      otherSalaryComponentsModel,
      eq(
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
        otherSalaryComponentsModel.otherSalaryComponentId
      )
    )
}

// Get By Id
export const getEmployeeOtherSalaryComponentById = async (
  employeeOtherSalaryComponentId: number
) => {
  const employeeOtherSalaryComponent = await db
    .select()
    .from(employeeOtherSalaryComponentsModel)
    .where(
      eq(
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
        employeeOtherSalaryComponentId
      )
    )
    .limit(1)

  if (!employeeOtherSalaryComponent.length) {
    throw BadRequestError('Cloth employeeOtherSalaryComponent not found')
  }

  return employeeOtherSalaryComponent[0]
}

// Delete
export const deleteEmployeeOtherSalaryComponent = async (
  employeeOtherSalaryComponentId: number
) => {
  const result = await db
    .delete(employeeOtherSalaryComponentsModel)
    .where(
      eq(
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
        employeeOtherSalaryComponentId
      )
    )
  return { message: 'Fees Group deleted successfully' }
}
