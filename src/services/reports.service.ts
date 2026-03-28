import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { db } from '../config/database'
import {
  departmentModel,
  designationModel,
  employeeAttendanceModel,
  employeeModel,
  employeeOtherSalaryComponentsModel,
  otherSalaryComponentsModel,
  salaryModel,
} from '../schemas'

export const employeeAttendanceReport = async (
  fromDate: string,
  toDate: string
) => {
  return await db
    .select({
      employeeAttendanceId: employeeAttendanceModel.employeeAttendanceId,
      employeeId: employeeAttendanceModel.employeeId,
      employeeName: employeeModel.fullName,
      designationId: employeeModel.designationId,
      designationName: designationModel.designationName,
      departmentId: employeeModel.departmentId,
      departmentName: departmentModel.departmentName,
      attendanceDate: employeeAttendanceModel.attendanceDate,
      inTime: employeeAttendanceModel.inTime,
      outTime: employeeAttendanceModel.outTime,
      lateInMinutes: employeeAttendanceModel.lateInMinutes,
      earlyOutMinutes: employeeAttendanceModel.earlyOutMinutes,
      createdAt: employeeAttendanceModel.createdAt,
    })
    .from(employeeAttendanceModel)
    .leftJoin(
      employeeModel,
      eq(employeeAttendanceModel.employeeId, employeeModel.employeeId)
    )
    .leftJoin(
      designationModel,
      eq(employeeModel.designationId, designationModel.designationId)
    )
    .leftJoin(
      departmentModel,
      eq(employeeModel.departmentId, departmentModel.departmentId)
    )
    .where(
      and(
        gte(employeeAttendanceModel.attendanceDate, fromDate),
        lte(employeeAttendanceModel.attendanceDate, toDate)
      )
    )
    .orderBy(
      employeeAttendanceModel.attendanceDate,
      employeeAttendanceModel.employeeId
    )
}

// service
export const salaryReport = async (salaryMonth: string, salaryYear: number) => {
  // Get main salary data with employee, department, and designation details
  const salaryData = await db
    .select({
      salaryId: salaryModel.salaryId,
      salaryMonth: salaryModel.salaryMonth,
      salaryYear: salaryModel.salaryYear,
      basicSalary: salaryModel.basicSalary,
      grossSalary: salaryModel.grossSalary,
      netSalary: salaryModel.netSalary,
      doj: salaryModel.doj,
      employeeId: salaryModel.employeeId,
      employeeName: employeeModel.fullName,
      departmentId: salaryModel.departmentId,
      departmentName: departmentModel.departmentName,
      designationId: salaryModel.designationId,
      designationName: designationModel.designationName,
      createdAt: salaryModel.createdAt,
    })
    .from(salaryModel)
    .innerJoin(
      employeeModel,
      eq(salaryModel.employeeId, employeeModel.employeeId)
    )
    .innerJoin(
      departmentModel,
      eq(salaryModel.departmentId, departmentModel.departmentId)
    )
    .innerJoin(
      designationModel,
      eq(salaryModel.designationId, designationModel.designationId)
    )
    .where(
      and(
        eq(salaryModel.salaryMonth, salaryMonth),
        eq(salaryModel.salaryYear, salaryYear)
      )
    )
    .orderBy(salaryModel.employeeId)

  if (salaryData.length === 0) {
    return []
  }

  // Get all other salary components for the employees in this salary period
  const employeeIds = salaryData.map((s) => s.employeeId)

  const otherSalaryComponents = await db
    .select({
      employeeOtherSalaryComponentId:
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
      employeeId: employeeOtherSalaryComponentsModel.employeeId,
      otherSalaryComponentId:
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
      amount: employeeOtherSalaryComponentsModel.amount,
      salaryMonth: employeeOtherSalaryComponentsModel.salaryMonth,
      salaryYear: employeeOtherSalaryComponentsModel.salaryYear,
      componentName: otherSalaryComponentsModel.componentName,
      componentType: otherSalaryComponentsModel.componentType,
    })
    .from(employeeOtherSalaryComponentsModel)
    .innerJoin(
      otherSalaryComponentsModel,
      eq(
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
        otherSalaryComponentsModel.otherSalaryComponentId
      )
    )
    .where(
      and(
        inArray(employeeOtherSalaryComponentsModel.employeeId, employeeIds),
        eq(employeeOtherSalaryComponentsModel.salaryMonth, salaryMonth),
        eq(employeeOtherSalaryComponentsModel.salaryYear, salaryYear)
      )
    )
    .orderBy(
      employeeOtherSalaryComponentsModel.employeeId,
      otherSalaryComponentsModel.componentType,
      otherSalaryComponentsModel.componentName
    )

  // Group other salary components by employee
  const componentsByEmployee = otherSalaryComponents.reduce(
    (acc, component) => {
      if (!acc[component.employeeId]) {
        acc[component.employeeId] = []
      }
      acc[component.employeeId].push(component)
      return acc
    },
    {} as Record<number, typeof otherSalaryComponents>
  )

  // Combine salary data with their other components
  const result = salaryData.map((salary) => ({
    ...salary,
    otherSalaryComponents: componentsByEmployee[salary.employeeId] || [],
    // Calculate total allowances and deductions for summary
    totalAllowances: (componentsByEmployee[salary.employeeId] || [])
      .filter((c) => c.componentType === 'Allowance')
      .reduce((sum, c) => sum + c.amount, 0),
    totalDeductions: (componentsByEmployee[salary.employeeId] || [])
      .filter((c) => c.componentType === 'Deduction')
      .reduce((sum, c) => sum + c.amount, 0),
  }))

  return result
}
