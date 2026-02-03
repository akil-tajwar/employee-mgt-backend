import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { employeeAttendanceModel, employeeModel, NewEmployeeAttendance } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createEmployeeAttendance = async (
  employeeAttendanceData: Omit<NewEmployeeAttendance, 'employeeAttendanceId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const result = await db
      .insert(employeeAttendanceModel)
      .values({
        ...employeeAttendanceData,
        createdAt: new Date().getTime(),
      })

    // Return the inserted data with the generated ID
    return {
      ...employeeAttendanceData,
      employeeAttendanceId: result.insertId, // or result[0].insertId depending on your ORM
      createdAt: new Date().getTime(),
    }
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllEmployeeAttendances = async () => {
  return await db
    .select({
      employeeAttendanceId: employeeAttendanceModel.employeeAttendanceId,
      employeeId: employeeAttendanceModel.employeeId,
      attendanceDate: employeeAttendanceModel.attendaceDate,
      inTime: employeeAttendanceModel.inTime,
      outTime: employeeAttendanceModel.outTime,
      employeeName: employeeModel.fullName,
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
export const getEmployeeAttendanceById = async (employeeAttendanceId: number) => {
  const employeeAttendance = await db
    .select()
    .from(employeeAttendanceModel)
    .where(eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId))
    .limit(1)

  if (!employeeAttendance.length) {
    throw BadRequestError('Cloth employeeAttendance not found')
  }

  return employeeAttendance[0]
}

// Update
export const editEmployeeAttendance = async (
  employeeAttendanceId: number,
  employeeAttendanceData: Partial<NewEmployeeAttendance>
) => {
  const [updatedEmployeeAttendance] = await db
    .update(employeeAttendanceModel)
    .set(employeeAttendanceData)
    .where(eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId))

  if (!updatedEmployeeAttendance) {
    throw BadRequestError('Cloth employeeAttendance not found')
  }

  return updatedEmployeeAttendance
}

// Delete
export const deleteEmployeeAttendance = async (employeeAttendanceId: number) => {
  const result = await db
    .delete(employeeAttendanceModel)
    .where(eq(employeeAttendanceModel.employeeAttendanceId, employeeAttendanceId));
  return { message: "Fees Group deleted successfully" };
};
