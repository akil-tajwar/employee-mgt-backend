import { and, eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  employeeAttendanceModel,
  employeeModel,
  NewEmployeeAttendance,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createEmployeeAttendance = async (
  data:
    | Omit<NewEmployeeAttendance, 'employeeAttendanceId' | 'updatedAt' | 'updatedBy'>
    | Omit<NewEmployeeAttendance, 'employeeAttendanceId' | 'updatedAt' | 'updatedBy'>[]
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

  // Insert all records
  await db.insert(employeeAttendanceModel).values(
    records.map((item) => ({
      ...item,
      createdAt: now,
    }))
  )

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
    .where(eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId))

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
