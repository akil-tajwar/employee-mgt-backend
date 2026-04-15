import { and, eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  employeeAttendanceModel,
  employeeModel,
  employeeOtherSalaryComponentsModel,
  NewEmployeeAttendance,
  otherSalaryComponentsModel,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createEmployeeAttendance = async (
  data:
    | Omit<
        NewEmployeeAttendance,
        'employeeAttendanceId' | 'updatedAt' | 'updatedBy'
      >
    | Omit<
        NewEmployeeAttendance,
        'employeeAttendanceId' | 'updatedAt' | 'updatedBy'
      >[]
) => {
  const records = Array.isArray(data) ? data : [data]
  const now = Date.now()

  // Collect conflicts
  const conflicts = []
  for (const item of records) {
    const existing = await db
      .select()
      .from(employeeAttendanceModel)
      .where(
        and(
          eq(employeeAttendanceModel.employeeId, item.employeeId),
          eq(employeeAttendanceModel.attendanceDate, item.attendanceDate)
        )
      )

    if (existing.length > 0) {
      conflicts.push(
        `This employee already has attendance for ${item.attendanceDate}`
      )
    }
  }

  if (conflicts.length > 0) {
    throw BadRequestError(conflicts.join(', '))
  }

  // Insert all attendance records
  await db.insert(employeeAttendanceModel).values(
    records.map((item) => ({
      ...item,
      createdAt: now,
    }))
  )

  // Prepare and insert other salary components
  const salaryComponentsToInsert = []

  for (const item of records) {
    // Parse attendance date to get month and year
    const attendanceDate = new Date(item.attendanceDate)
    const salaryMonth = attendanceDate.toLocaleString('default', {
      month: 'long',
    })
    const salaryYear = attendanceDate.getFullYear()

    let otherSalaryComponentId = null

    // Determine which other salary component to add
    if (item.isAbsent === 1) {
      otherSalaryComponentId = 5 // Absent deduction
    } else if (
      (item.lateInMinutes && item.lateInMinutes > 0) ||
      (item.earlyOutMinutes && item.earlyOutMinutes > 0)
    ) {
      otherSalaryComponentId = 2 // Late/Early out deduction
    }

    // If we need to add a salary component
    if (otherSalaryComponentId) {
      // Fetch the salary component details including forDays
      const [salaryComponent] = await db
        .select()
        .from(otherSalaryComponentsModel)
        .where(
          eq(
            otherSalaryComponentsModel.otherSalaryComponentId,
            otherSalaryComponentId
          )
        )
        .limit(1)

      if (salaryComponent) {
        let isAuthorized = 1 // Default to authorized

        // Check if forDays is 0, then always authorized
        if (salaryComponent.forDays === 0) {
          isAuthorized = 1
        } else {
          // Get count of existing records for this employee, month, year, and component
          const existingCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(employeeOtherSalaryComponentsModel)
            .where(
              and(
                eq(
                  employeeOtherSalaryComponentsModel.employeeId,
                  item.employeeId
                ),
                eq(
                  employeeOtherSalaryComponentsModel.otherSalaryComponentId,
                  otherSalaryComponentId
                ),
                eq(employeeOtherSalaryComponentsModel.salaryMonth, salaryMonth),
                eq(employeeOtherSalaryComponentsModel.salaryYear, salaryYear)
              )
            )

          const existingCount = existingCountResult[0]?.count || 0

          // Calculate isAuthorized based on forDays cycle
          const forDays = salaryComponent.forDays || 1 // Default to 1 if null/undefined
          // The cycle: first forDays entries = authorized, next forDays = unauthorized, repeats
          const cyclePosition = existingCount % (forDays * 2)
          isAuthorized = cyclePosition < forDays ? 1 : 0
        }

        salaryComponentsToInsert.push({
          employeeId: item.employeeId,
          otherSalaryComponentId: otherSalaryComponentId,
          salaryMonth: salaryMonth,
          salaryYear: salaryYear,
          amount: salaryComponent.amount,
          isAuthorized: isAuthorized,
          createdBy: item.createdBy,
          createdAt: now,
        })
      }
    }
  }

  // Insert all other salary components if any
  if (salaryComponentsToInsert.length > 0) {
    await db
      .insert(employeeOtherSalaryComponentsModel)
      .values(salaryComponentsToInsert)
  }

  return Array.isArray(data)
    ? records.map((item) => ({ ...item, createdAt: now }))
    : { ...records[0], createdAt: now }
}

// Update
export const editEmployeeAttendance = async (
  employeeAttendanceId: number,
  employeeAttendanceData: Partial<NewEmployeeAttendance>
) => {
  const result = await db
    .update(employeeAttendanceModel)
    .set({
      ...employeeAttendanceData,
      updatedAt: Date.now(),
    })
    .where(
      eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId)
    )

  // SQLite update result check
  if (result.changes === 0) {
    throw BadRequestError('Employee attendance not found')
  }

  return {
    employeeAttendanceId,
    ...employeeAttendanceData,
  }
}

// Get All
export const getAllEmployeeAttendances = async () => {
  return await db
    .select({
      employeeAttendanceId: employeeAttendanceModel.employeeAttendanceId,
      employeeId: employeeAttendanceModel.employeeId,
      attendanceDate: employeeAttendanceModel.attendanceDate,
      inTime: employeeAttendanceModel.inTime,
      outTime: employeeAttendanceModel.outTime,
      employeeName: employeeModel.fullName,
      lateInMinutes: employeeAttendanceModel.lateInMinutes,
      earlyOutMinutes: employeeAttendanceModel.earlyOutMinutes,
      isAbsent: employeeAttendanceModel.isAbsent,
      createdBy: employeeAttendanceModel.createdBy,
      createdAt: employeeAttendanceModel.createdAt,
      updatedBy: employeeAttendanceModel.updatedBy,
      updatedAt: employeeAttendanceModel.updatedAt,
    })
    .from(employeeAttendanceModel)
    .leftJoin(
      employeeModel,
      eq(employeeAttendanceModel.employeeId, employeeModel.employeeId)
    )
}

// Get By Id
export const getEmployeeAttendanceById = async (
  employeeAttendanceId: number
) => {
  const employeeAttendance = await db
    .select()
    .from(employeeAttendanceModel)
    .where(
      eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId)
    )
    .limit(1)

  if (!employeeAttendance.length) {
    throw BadRequestError('Cloth employeeAttendance not found')
  }

  return employeeAttendance[0]
}

// Delete
export const deleteEmployeeAttendance = async (
  employeeAttendanceId: number
) => {
  const result = await db
    .delete(employeeAttendanceModel)
    .where(
      eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId)
    )
  return { message: 'Fees Group deleted successfully' }
}
