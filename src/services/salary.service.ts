import { db } from '../config/database'
import {
  salaryModel,
  NewSalary,
  employeeModel,
  departmentModel,
  designationModel,
  employeeOtherSalaryComponentsModel,
  NewEmployeeOtherSalaryComponent,
  otherSalaryComponentsModel,
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
      componentName: otherSalaryComponentsModel.componentName,
      componentType: otherSalaryComponentsModel.componentType,

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
    .leftJoin(otherSalaryComponentsModel,
      and(
        eq(
          employeeOtherSalaryComponentsModel.otherSalaryComponentId,
          otherSalaryComponentsModel.otherSalaryComponentId
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

          employeeId: row.employeeId,
          employeeName: row.employeeName,

          departmentId: row.departmentId,
          departmentName: row.departmentName,

          designationId: row.designationId,
          designationName: row.designationName,
          createdAt: row.createdAt,
        },
        otherSalary: [],
      })
    }

    if (row.otherSalaryComponentId) {
      map.get(row.salaryId).otherSalary.push({
        otherSalaryComponentId: row.otherSalaryComponentId,
        amount: row.otherAmount,
        componentName: row.componentName,
        componentType: row.componentType,
        salaryMonth: row.salaryMonth,
        salaryYear: row.salaryYear,
        employeeId: row.employeeId,
        employeeName: row.employeeName,
      })
    }
  }

  return Array.from(map.values())
}

// UPDATE
type UpdateSalaryPayload = {
  salary: Partial<NewSalary>
  otherSalary?: NewEmployeeOtherSalaryComponent[]
}
export const updateSalaryWithOtherSalaryComponents = async (
  salaryId: number,
  data: UpdateSalaryPayload
) => {
  return await db.transaction(async (tx) => {
    /* ---------------- update salary ---------------- */
    await tx
      .update(salaryModel)
      .set(data.salary)
      .where(eq(salaryModel.salaryId, salaryId))

    /* ---------------- delete old other salary components ---------------- */
    await tx
      .delete(employeeOtherSalaryComponentsModel)
      .where(
        and(
          eq(
            employeeOtherSalaryComponentsModel.employeeId,
            data.salary.employeeId!
          ),
          eq(
            employeeOtherSalaryComponentsModel.salaryMonth,
            data.salary.salaryMonth!
          ),
          eq(
            employeeOtherSalaryComponentsModel.salaryYear,
            data.salary.salaryYear!
          )
        )
      )

    /* ---------------- insert new other salary components ---------------- */
    if (data.otherSalary && data.otherSalary.length > 0) {
      await tx
        .insert(employeeOtherSalaryComponentsModel)
        .values(data.otherSalary)
    }

    /* ---------------- fetch updated data ---------------- */
    const [salary] = await tx
      .select()
      .from(salaryModel)
      .where(eq(salaryModel.salaryId, salaryId))

    const otherSalary = await tx
      .select()
      .from(employeeOtherSalaryComponentsModel)
      .where(
        and(
          eq(employeeOtherSalaryComponentsModel.employeeId, salary.employeeId),
          eq(
            employeeOtherSalaryComponentsModel.salaryMonth,
            salary.salaryMonth
          ),
          eq(employeeOtherSalaryComponentsModel.salaryYear, salary.salaryYear)
        )
      )

    return {
      salary,
      otherSalary,
    }
  })
}

// DELETE
export const deleteSalaryWithOtherSalaryComponents = async (
  salaryId: number
) => {
  return await db.transaction(async (tx) => {
    /* ---------------- get salary ---------------- */
    const [salary] = await tx
      .select()
      .from(salaryModel)
      .where(eq(salaryModel.salaryId, salaryId))

    if (!salary) return

    /* ---------------- delete other salary components ---------------- */
    await tx
      .delete(employeeOtherSalaryComponentsModel)
      .where(
        and(
          eq(employeeOtherSalaryComponentsModel.employeeId, salary.employeeId),
          eq(
            employeeOtherSalaryComponentsModel.salaryMonth,
            salary.salaryMonth
          ),
          eq(employeeOtherSalaryComponentsModel.salaryYear, salary.salaryYear)
        )
      )

    /* ---------------- delete salary ---------------- */
    await tx.delete(salaryModel).where(eq(salaryModel.salaryId, salaryId))
  })
}
