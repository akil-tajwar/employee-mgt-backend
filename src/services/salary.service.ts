import { db } from '../config/database'
import {
  salaryModel,
  NewSalary,
  employeeModel,
  departmentModel,
  designationModel,
  employeeOtherSalaryComponentsModel,
  NewEmployeeOtherSalaryComponent,
} from '../schemas'
import { and, eq, inArray } from 'drizzle-orm'

// CREATE
type CreateSalaryPayload = {
  salary: NewSalary
  otherSalary?: NewEmployeeOtherSalaryComponent[]
}

export const createSalaryWithOtherSalaryComponents = async (
  data: CreateSalaryPayload
) => {
  return await db.transaction(async (tx) => {
    /* -------------------- insert salary -------------------- */
    const salaryResult = await tx.insert(salaryModel).values(data.salary)

    const salaryId = Number(salaryResult.lastInsertRowid)

    /* ---------------- insert other salary components ---------------- */
    if (data.otherSalary && data.otherSalary.length > 0) {
      await tx
        .insert(employeeOtherSalaryComponentsModel)
        .values(data.otherSalary)
    }

    /* ---------------- fetch inserted data ---------------- */
    const salary = await tx
      .select()
      .from(salaryModel)
      .where(eq(salaryModel.salaryId, salaryId))
      .limit(1)

    const otherSalary = data.otherSalary?.length
      ? await tx
          .select()
          .from(employeeOtherSalaryComponentsModel)
          .where(
            eq(
              employeeOtherSalaryComponentsModel.employeeId,
              data.salary.employeeId
            )
          )
      : []

    return {
      salary: salary[0],
      otherSalary,
    }
  })
}

// GET ALL
export const getSalarys = async () => {
  const rows = await db
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
      employeeName: employeeModel.fullName,

      // Department
      departmentId: departmentModel.departmentId,
      departmentName: departmentModel.departmentName,

      // Designation
      designationId: designationModel.designationId,
      designationName: designationModel.designationName,

      // Other salary
      otherSalaryComponentId:
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
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
      and(
        eq(
          salaryModel.employeeId,
          employeeOtherSalaryComponentsModel.employeeId
        ),
        eq(
          salaryModel.salaryMonth,
          employeeOtherSalaryComponentsModel.salaryMonth
        ),
        eq(
          salaryModel.salaryYear,
          employeeOtherSalaryComponentsModel.salaryYear
        )
      )
    )

  /* ---------------- GROUP RESULT ---------------- */

  const map = new Map<number, any>()

  for (const row of rows) {
    if (!map.has(row.salaryId)) {
      map.set(row.salaryId, {
        salary: {
          salaryId: row.salaryId,
          salaryMonth: row.salaryMonth,
          salaryYear: row.salaryYear,
          basicSalary: row.basicSalary,
          grossSalary: row.grossSalary,
          netSalary: row.netSalary,
          doj: row.doj,
          createdAt: row.createdAt,

          employee: {
            employeeId: row.employeeId,
            employeeName: row.employeeName,
          },

          department: {
            departmentId: row.departmentId,
            departmentName: row.departmentName,
          },

          designation: {
            designationId: row.designationId,
            designationName: row.designationName,
          },
        },
        otherSalary: [],
      })
    }

    if (row.otherSalaryComponentId) {
      map.get(row.salaryId).otherSalary.push({
        otherSalaryComponentId: row.otherSalaryComponentId,
        amount: row.otherAmount,
      })
    }
  }

  return Array.from(map.values())
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
  await db.delete(salaryModel).where(eq(salaryModel.salaryId, salaryId))
}
