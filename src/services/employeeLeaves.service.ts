import { db } from '../config/database'
import {
  departmentModel,
  designationModel,
  employeeAttendanceModel,
  EmployeeLeave,
  employeeLeaveModel,
  employeeLeaveTypeModel,
  employeeModel,
  employeeOtherSalaryComponentsModel,
  leaveTypeModel,
  NewEmployeeLeave,
  otherSalaryComponentsModel,
} from '../schemas'
import { and, eq, sql } from 'drizzle-orm'
import { BadRequestError } from './utils/errors.utils'

// CREATE
export const createEmployeeLeave = async (data: NewEmployeeLeave) => {
  const now = Date.now()

  // Parse dates
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)

  // Validate date range
  if (startDate > endDate) {
    throw BadRequestError('Start date cannot be after end date')
  }

  // Fetch employee details
  const [employee] = await db
    .select()
    .from(employeeModel)
    .where(eq(employeeModel.employeeId, data.employeeId))
    .limit(1)

  if (!employee) {
    throw BadRequestError('Employee not found')
  }

  // Fetch leave type details
  const [leaveType] = await db
    .select()
    .from(leaveTypeModel)
    .where(eq(leaveTypeModel.leaveTypeId, data.leaveTypeId))
    .limit(1)

  if (!leaveType) {
    throw BadRequestError('Leave type not found')
  }

  // Check if employee is eligible for this leave type
  const [employeeLeaveType] = await db
    .select()
    .from(employeeLeaveTypeModel)
    .where(
      and(
        eq(employeeLeaveTypeModel.employeeId, data.employeeId),
        eq(employeeLeaveTypeModel.leaveTypeId, data.leaveTypeId)
      )
    )
    .limit(1)

  if (!employeeLeaveType) {
    throw BadRequestError('Employee is not eligible for this leave type')
  }

  // Calculate number of leave days (excluding weekends? Assuming all days count)
  const leaveDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

  // Get current year period
  const currentYear = new Date().getFullYear()
  const yearPeriod = leaveType.yearPeriod

  // Calculate the start of the year period (assuming it's from Jan 1st or based on company policy)
  // Adjust this based on your business logic
  const periodStartDate = new Date(currentYear, 0, 1) // Jan 1st of current year
  const periodEndDate = new Date(currentYear, 11, 31) // Dec 31st of current year

  // Count existing leaves taken in this year period
  const existingLeavesCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(employeeLeaveModel)
    .where(
      and(
        eq(employeeLeaveModel.employeeId, data.employeeId),
        eq(employeeLeaveModel.leaveTypeId, data.leaveTypeId),
        sql`date(${employeeLeaveModel.startDate}) >= date(${periodStartDate.toISOString().split('T')[0]})`,
        sql`date(${employeeLeaveModel.endDate}) <= date(${periodEndDate.toISOString().split('T')[0]})`
      )
    )

  const existingLeavesCount = existingLeavesCountResult[0]?.count || 0

  // Check if total leaves (existing + new) exceeds totalLeaves
  if (existingLeavesCount + leaveDays > leaveType.totalLeaves) {
    throw BadRequestError(
      `Cannot create leave. Employee has already taken ${existingLeavesCount} days out of ${leaveType.totalLeaves} total leaves for this leave type. Requested ${leaveDays} days.`
    )
  }

  // Insert into employeeLeave table
  const result = await db.insert(employeeLeaveModel).values({
    ...data,
    createdAt: now,
    updatedAt: now,
  })

  const employeeLeaveId = Number(result.lastInsertRowid)

  // Generate all dates between startDate and endDate
  const dateArray = []
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dateArray.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Prepare attendance records
  const attendanceRecords = []
  const salaryComponentsToInsert = []

  for (const date of dateArray) {
    const attendanceDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const salaryMonth = date.toLocaleString('default', { month: 'long' })
    const salaryYear = date.getFullYear()

    // Check if attendance already exists for this date
    const [existingAttendance] = await db
      .select()
      .from(employeeAttendanceModel)
      .where(
        and(
          eq(employeeAttendanceModel.employeeId, data.employeeId),
          eq(employeeAttendanceModel.attendanceDate, attendanceDate)
        )
      )
      .limit(1)

    if (existingAttendance) {
      throw BadRequestError(
        `Attendance already exists for employee on ${attendanceDate}`
      )
    }

    // Add attendance record with isAbsent = 1
    attendanceRecords.push({
      employeeId: data.employeeId,
      attendanceDate: attendanceDate,
      isAbsent: 1,
      createdBy: data.createdBy,
      createdAt: now,
    })

    // Add other salary component (Absent deduction)
    // Fetch the salary component amount for absent deduction (ID=5)
    const [salaryComponent] = await db
      .select()
      .from(otherSalaryComponentsModel)
      .where(eq(otherSalaryComponentsModel.otherSalaryComponentId, 5))
      .limit(1)

    if (salaryComponent) {
      salaryComponentsToInsert.push({
        employeeId: data.employeeId,
        otherSalaryComponentId: 5, // Absent deduction
        salaryMonth: salaryMonth,
        salaryYear: salaryYear,
        amount: salaryComponent.amount,
        isAuthorized: 1, // Always authorized for leave
        createdBy: data.createdBy,
        createdAt: now,
      })
    }
  }

  // Insert attendance records
  if (attendanceRecords.length > 0) {
    await db.insert(employeeAttendanceModel).values(attendanceRecords)
  }

  // Insert other salary components
  if (salaryComponentsToInsert.length > 0) {
    await db
      .insert(employeeOtherSalaryComponentsModel)
      .values(salaryComponentsToInsert)
  }

  // Fetch and return the created leave
  const [employeeLeave] = await db
    .select()
    .from(employeeLeaveModel)
    .where(eq(employeeLeaveModel.employeeLeaveId, employeeLeaveId))

  return employeeLeave
}
// READ ALL
export const getEmployeeLeaves = async () => {
  return await db
    .select({
      // EmployeeLeave fields
      employeeLeaveId: employeeLeaveModel.employeeLeaveId,
      employeeId: employeeLeaveModel.employeeId,
      startDate: employeeLeaveModel.startDate,
      endDate: employeeLeaveModel.endDate,
      noOfDays: employeeLeaveModel.noOfDays,
      leaveTypeId: employeeLeaveModel.leaveTypeId,
      description: employeeLeaveModel.description,
      createdBy: employeeLeaveModel.createdBy,
      createdAt: employeeLeaveModel.createdAt,
      updatedBy: employeeLeaveModel.updatedBy,
      updatedAt: employeeLeaveModel.updatedAt,
      // Employee fields (adjust based on your employeeModel schema)
      empCode: employeeModel.empCode,
      employeeName: employeeModel.fullName,
      departmentName: departmentModel.departmentName, // Assuming designation has department info
      designationName: designationModel.designationName,
      // LeaveType fields (adjust based on your leaveTypeModel schema)
      leaveTypeName: leaveTypeModel.leaveTypeName,
      // Add other fields as needed
    })
    .from(employeeLeaveModel)
    .leftJoin(
      employeeModel,
      eq(employeeLeaveModel.employeeId, employeeModel.employeeId)
    )
    .leftJoin(
      leaveTypeModel,
      eq(employeeLeaveModel.leaveTypeId, leaveTypeModel.leaveTypeId)
    )
}

// UPDATE
export const updateEmployeeLeave = async (data: EmployeeLeave) => {
  await db
    .update(employeeLeaveModel)
    .set({ ...data })
    .where(eq(employeeLeaveModel.employeeLeaveId, data.employeeLeaveId))

  const [updated] = await db
    .select()
    .from(employeeLeaveModel)
    .where(eq(employeeLeaveModel.employeeLeaveId, data.employeeLeaveId))

  return updated
}

// DELETE
export const deleteEmployeeLeave = async (employeeLeaveId: number) => {
  await db
    .delete(employeeLeaveModel)
    .where(eq(employeeLeaveModel.employeeLeaveId, employeeLeaveId))
}
