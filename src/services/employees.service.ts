import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  employeeModel,
  departmentModel,
  designationModel,
  employeeTypeModel,
  employeeLeaveTypeModel,
} from '../schemas'

//TYPES
export type Employee = {
  fullName: string
  email: string
  officialPhone: string
  personalPhone?: string | null
  presentAddress: string
  permanentAddress?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  photoUrl?: string | null
  cvUrl?: string | null // ✅ ADD
  dob: string
  doj: string
  gender: 'Male' | 'Female'
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
  basicSalary: number
  grossSalary: number
  isActive?: number
  empCode: string
  departmentId: number
  designationId: number
  employeeTypeId: number
  officeTimingId: number
  leaveTypeIds: number[] // ✅ RENAME (better than weekends)
  createdBy: number
}

//CREATE
export const createEmployee = (data: Employee) => {
  return db.transaction((tx) => {
    // 1️⃣ Insert employee
    const insertResult = tx
      .insert(employeeModel)
      .values({
        fullName: data.fullName,
        email: data.email,
        officialPhone: data.officialPhone,
        personalPhone: data.personalPhone ?? null,
        presentAddress: data.presentAddress,
        permanentAddress: data.permanentAddress ?? null,
        emergencyContactName: data.emergencyContactName ?? null,
        emergencyContactPhone: data.emergencyContactPhone ?? null,
        photoUrl: data.photoUrl ?? null,
        cvUrl: data.cvUrl ?? null, // ✅ ADD
        dob: data.dob,
        doj: data.doj,
        gender: data.gender,
        bloodGroup: data.bloodGroup ?? null,
        basicSalary: data.basicSalary,
        grossSalary: data.grossSalary,
        isActive: data.isActive ?? 1,
        empCode: data.empCode,
        departmentId: data.departmentId,
        designationId: data.designationId,
        employeeTypeId: data.employeeTypeId,
        officeTimingId: data.officeTimingId,
        createdBy: data.createdBy,
      })
      .run()

    const employeeId = Number(insertResult.lastInsertRowid)

    // 2️⃣ Insert employee leave types (BULK)
    if (data.leaveTypeIds?.length) {
      tx.insert(employeeLeaveTypeModel)
        .values(
          data.leaveTypeIds.map((leaveTypeId) => ({
            employeeId,
            leaveTypeId,
          }))
        )
        .run()
    }

    // 3️⃣ Return created employee
    return tx
      .select()
      .from(employeeModel)
      .where(eq(employeeModel.employeeId, employeeId))
      .get()
  })
}

export const updateEmployee = async (
  employeeId: number,
  data: Partial<Employee>
) => {
  return db.transaction(async (tx) => {
    const existing = await tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })

    if (!existing) throw new Error('Employee not found')

    await tx
      .update(employeeModel)
      .set({
        fullName: data.fullName ?? existing.fullName,
        email: data.email ?? existing.email,
        officialPhone: data.officialPhone ?? existing.officialPhone,
        personalPhone: data.personalPhone ?? existing.personalPhone,
        presentAddress: data.presentAddress ?? existing.presentAddress,
        permanentAddress: data.permanentAddress ?? existing.permanentAddress,
        emergencyContactName:
          data.emergencyContactName ?? existing.emergencyContactName,
        emergencyContactPhone:
          data.emergencyContactPhone ?? existing.emergencyContactPhone,
        photoUrl: data.photoUrl ?? existing.photoUrl,
        cvUrl: data.cvUrl ?? existing.cvUrl,
        dob: data.dob ?? existing.dob,
        doj: data.doj ?? existing.doj,
        gender: data.gender ?? existing.gender,
        bloodGroup: data.bloodGroup ?? existing.bloodGroup,
        basicSalary: data.basicSalary ?? existing.basicSalary,
        grossSalary: data.grossSalary ?? existing.grossSalary,
        isActive: data.isActive ?? existing.isActive,
        empCode: data.empCode ?? existing.empCode,
        departmentId: data.departmentId ?? existing.departmentId,
        designationId: data.designationId ?? existing.designationId,
        employeeTypeId: data.employeeTypeId ?? existing.employeeTypeId,
      })
      .where(eq(employeeModel.employeeId, employeeId))

    // 🔁 Update leave types
    if (data.leaveTypeIds) {
      await tx
        .delete(employeeLeaveTypeModel)
        .where(eq(employeeLeaveTypeModel.employeeId, employeeId))

      if (data.leaveTypeIds.length) {
        await tx.insert(employeeLeaveTypeModel).values(
          data.leaveTypeIds.map((leaveTypeId) => ({
            employeeId,
            leaveTypeId,
          }))
        )
      }
    }

    return tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })
  })
}

//GET ALL EMPLOYEES
export const getAllEmployees = async () => {
  return db
    .select({
      employeeId: employeeModel.employeeId,
      fullName: employeeModel.fullName,
      email: employeeModel.email,
      officialPhone: employeeModel.officialPhone,
      personalPhone: employeeModel.personalPhone,
      gender: employeeModel.gender,
      empCode: employeeModel.empCode,
      basicSalary: employeeModel.basicSalary,
      grossSalary: employeeModel.grossSalary,
      isActive: employeeModel.isActive,
      departmentId: employeeModel.departmentId,
      designationId: employeeModel.designationId,
      employeeTypeId: employeeModel.employeeTypeId,
      officeTimingId: employeeModel.officeTimingId,
      departmentName: departmentModel.departmentName,
      designationName: designationModel.designationName,
      employeeTypeName: employeeTypeModel.employeeTypeName,
    })
    .from(employeeModel)
    .leftJoin(
      departmentModel,
      eq(employeeModel.departmentId, departmentModel.departmentId)
    )
    .leftJoin(
      designationModel,
      eq(employeeModel.designationId, designationModel.designationId)
    )
    .leftJoin(
      employeeTypeModel,
      eq(employeeModel.employeeTypeId, employeeTypeModel.employeeTypeId)
    )
}

//GET EMPLOYEE BY ID (WITH WEEKENDS)
export const getEmployeeById = async (employeeId: number) => {
  const employee = await db
    .select()
    .from(employeeModel)
    .where(eq(employeeModel.employeeId, employeeId))
    .get()

  if (!employee) return null

  const weekends = await db
    .select({ weekendId: employeeLeaveTypeModel.leaveTypeId })
    .from(employeeLeaveTypeModel)
    .where(eq(employeeLeaveTypeModel.employeeId, employeeId))

  return {
    ...employee,
    leaveTypeIds: weekends.map((w) => w.weekendId),
  }
}

//DELETE
export const deleteEmployee = async (employeeId: number) => {
  return await db.transaction(async (tx) => {
    const existing = await tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })

    if (!existing) {
      throw new Error('Employee not found')
    }

    await tx
      .delete(employeeModel)
      .where(eq(employeeModel.employeeId, employeeId))

    return {
      message: 'Employee deleted successfully',
      deletedEmployee: existing,
    }
  })
}
