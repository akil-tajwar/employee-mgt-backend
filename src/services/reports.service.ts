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
      empCode: employeeModel.empCode,
      employeeName: employeeModel.fullName,
      departmentId: salaryModel.departmentId,
      departmentName: departmentModel.departmentName,
      designationId: salaryModel.designationId,
      designationName: designationModel.designationName,
      createdBy: salaryModel.createdBy,
      createdAt: salaryModel.createdAt,
      updatedBy: salaryModel.updatedBy,
      updatedAt: salaryModel.updatedAt,
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
    return null
  }

  // Get all other salary components for the employees in this salary period
  const employeeIds = salaryData.map((s) => s.employeeId)

  const otherSalaryComponents = await db
    .select({
      employeeOtherSalaryComponentId:
        employeeOtherSalaryComponentsModel.employeeOtherSalaryComponentId,
      employeeId: employeeOtherSalaryComponentsModel.employeeId,
      empCode: employeeModel.empCode,
      employeeName: employeeModel.fullName,
      otherSalaryComponentId:
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
      componentName: otherSalaryComponentsModel.componentName,
      componentType: otherSalaryComponentsModel.componentType,
      amount: employeeOtherSalaryComponentsModel.amount,
      salaryMonth: employeeOtherSalaryComponentsModel.salaryMonth,
      salaryYear: employeeOtherSalaryComponentsModel.salaryYear,
      createdBy: employeeOtherSalaryComponentsModel.createdBy,
      createdAt: employeeOtherSalaryComponentsModel.createdAt,
      updatedBy: employeeOtherSalaryComponentsModel.updatedBy,
      updatedAt: employeeOtherSalaryComponentsModel.updatedAt,
    })
    .from(employeeOtherSalaryComponentsModel)
    .innerJoin(
      otherSalaryComponentsModel,
      eq(
        employeeOtherSalaryComponentsModel.otherSalaryComponentId,
        otherSalaryComponentsModel.otherSalaryComponentId
      )
    )
    .innerJoin(
      employeeModel,
      eq(
        employeeOtherSalaryComponentsModel.employeeId,
        employeeModel.employeeId
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

  // Transform salary data to match the schema
  // Since there should be only one salary record per employee, but if multiple, we'll handle
  const transformedSalary = salaryData.map((salary) => ({
    salaryMonth: salary.salaryMonth,
    salaryYear: salary.salaryYear,
    employeeId: salary.employeeId,
    empCode: salary.empCode,
    employeeName: salary.employeeName,
    departmentId: salary.departmentId,
    departmentName: salary.departmentName,
    designationId: salary.designationId,
    designationName: salary.designationName,
    basicSalary: salary.basicSalary,
    grossSalary: salary.grossSalary,
    netSalary: salary.netSalary,
    doj: salary.doj,
    createdBy: salary.createdBy,
    createdAt: salary.createdAt,
    updatedBy: salary.updatedBy,
    updatedAt: salary.updatedAt,
  }))

  // Transform other salary components to match the schema
  const transformedOtherSalary = otherSalaryComponents.map((component) => ({
    employeeId: component.employeeId,
    empCode: component.empCode,
    employeeName: component.employeeName,
    otherSalaryComponentId: component.otherSalaryComponentId,
    componentName: component.componentName,
    componentType: component.componentType as 'Allowance' | 'Deduction',
    salaryMonth: component.salaryMonth,
    salaryYear: component.salaryYear,
    amount: component.amount,
    createdBy: component.createdBy,
    createdAt: component.createdAt,
    updatedBy: component.updatedBy,
    updatedAt: component.updatedAt,
  }))

  // Return in the format expected by the schema
  return {
    salary:
      transformedSalary.length === 1 ? transformedSalary[0] : transformedSalary,
    otherSalary: transformedOtherSalary,
  }
}
