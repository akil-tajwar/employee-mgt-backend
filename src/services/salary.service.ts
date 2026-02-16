import { db } from '../config/database'
import { salaryModel, NewSalary, employeeModel, departmentModel, designationModel, employeeOtherSalaryComponentsModel } from '../schemas'
import { eq, inArray } from 'drizzle-orm'

// CREATE
export const createSalary = async (data: NewSalary | NewSalary[]) => {
  // normalize to array
  const values = Array.isArray(data) ? data : [data]

  const result = await db.insert(salaryModel).values(values)

  // SQLite specific
  const lastId = Number(result.lastInsertRowid)
  const firstId = lastId - values.length + 1

  return await db
    .select()
    .from(salaryModel)
    .where(
      inArray(
        salaryModel.salaryId,
        Array.from({ length: values.length }, (_, i) => firstId + i)
      )
    )
}

// GET ALL
export const getSalarys = async () => {
  return await db
    .select({
      // Salary
      salaryId: salaryModel.salaryId,
      salaryMonth: salaryModel.salaryMonth,
      salaryYear: salaryModel.salaryYear,
      basicSalary: salaryModel.basicSalary,
      grossSalary: salaryModel.grossSalary,
      netSalary: salaryModel.netSalary,
      doj: salaryModel.doj,

      // Employee
      employeeId: employeeModel.employeeId,
      employeeName: employeeModel.fullName, // adjust if needed

      // Department
      departmentId: departmentModel.departmentId,
      departmentName: departmentModel.departmentName,

      // Designation
      designationId: designationModel.designationId,
      designationName: designationModel.designationName,

      // Other salary component
      otherSalaryComponentId:
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
      otherAmount: employeeOtherSalaryComponentsModel.amount,

      createdAt: salaryModel.createdAt,
    })
    .from(salaryModel)
    .leftJoin(
      employeeModel,
      eq(salaryModel.employeeId, employeeModel.employeeId)
    )
    .leftJoin(
      departmentModel,
      eq(salaryModel.departmentId, departmentModel.departmentId)
    )
    .leftJoin(
      designationModel,
      eq(salaryModel.designationId, designationModel.designationId)
    )
    .leftJoin(
      employeeOtherSalaryComponentsModel,
      eq(
        salaryModel.employeeOtherSalaryComponentId,
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId
      )
    )
}

// UPDATE
export const updateSalary = async (
  salaryId: number,
  data: Partial<NewSalary>
) => {
  await db
    .update(salaryModel)
    .set(data)
    .where(eq(salaryModel.salaryId, salaryId))

  const [updated] = await db
    .select()
    .from(salaryModel)
    .where(eq(salaryModel.salaryId, salaryId))

  return updated
}

// DELETE
export const deleteSalary = async (salaryId: number) => {
  await db
    .delete(salaryModel)
    .where(eq(salaryModel.salaryId, salaryId))
}
