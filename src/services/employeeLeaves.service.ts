import { db } from '../config/database'
import { departmentModel, designationModel, EmployeeLeave, employeeLeaveModel, employeeModel, leaveTypeModel, NewEmployeeLeave } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createEmployeeLeave = async (data: NewEmployeeLeave) => {
  const result = await db.insert(employeeLeaveModel).values(data)

  const employeeLeaveId = Number(result.lastInsertRowid)

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
    .leftJoin(employeeModel, eq(employeeLeaveModel.employeeId, employeeModel.employeeId))
    .leftJoin(leaveTypeModel, eq(employeeLeaveModel.leaveTypeId, leaveTypeModel.leaveTypeId));
};

// UPDATE
export const updateEmployeeLeave = async (
  data: EmployeeLeave
) => {
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
