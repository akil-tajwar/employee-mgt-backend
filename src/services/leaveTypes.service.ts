import { db } from '../config/database'
import { leaveTypeModel } from '../schemas'
import { eq } from 'drizzle-orm'

// CREATE
export const createLeaveType = async (leaveTypeName: string, totalLeaves: number, createdBy: number) => {
  const result = await db.insert(leaveTypeModel).values({ leaveTypeName, totalLeaves, createdBy })

  const leaveTypeId = Number(result.lastInsertRowid)

  const [leaveType] = await db
    .select()
    .from(leaveTypeModel)
    .where(eq(leaveTypeModel.leaveTypeId, leaveTypeId))

  return leaveType
}

// READ ALL
export const getLeaveTypes = async () => {
  return await db.select().from(leaveTypeModel)
}

// UPDATE
export const updateLeaveType = async (
  leaveTypeId: number,
  leaveTypeName: string,
  totalLeaves: number,
  updatedBy: number
) => {
  await db
    .update(leaveTypeModel)
    .set({ leaveTypeName, totalLeaves, updatedBy })
    .where(eq(leaveTypeModel.leaveTypeId, leaveTypeId))

  const [updated] = await db
    .select()
    .from(leaveTypeModel)
    .where(eq(leaveTypeModel.leaveTypeId, leaveTypeId))

  return updated
}

// DELETE
export const deleteLeaveType = async (leaveTypeId: number) => {
  await db
    .delete(leaveTypeModel)
    .where(eq(leaveTypeModel.leaveTypeId, leaveTypeId))
}
