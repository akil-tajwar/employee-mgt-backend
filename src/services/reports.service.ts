import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  departmentModel,
  designationModel,
  employeeAttendanceModel,
  employeeModel,
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
