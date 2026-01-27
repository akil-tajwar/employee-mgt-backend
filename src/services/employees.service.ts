import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  employeeModel,
  departmentModel,
  designationModel,
  employeeTypeModel,
} from '../schemas'

//TYPES
export type EmployeeDetails = {
  fullName: string
  email: string
  officialPhone: string
  personalPhone?: string | null
  presentAddress: string
  permanentAddress?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  photoUrl?: string | null
  dob: string
  doj: string
  gender: 'Male' | 'Female'
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null
  basicSalary: number
  gorssSalary: number
  isActive?: number
  empCode: string
  departmentId: number
  designationId: number
  employeeTypeId: number
  createdBy: number
}


//CREATE
export const createEmployee = async (data: EmployeeDetails) => {
  return await db.transaction(async (tx) => {
    const result = await tx.insert(employeeModel).values({
      fullName: data.fullName,
      email: data.email,
      officialPhone: data.officialPhone,
      personalPhone: data.personalPhone ?? null,
      presentAddress: data.presentAddress,
      permanentAddress: data.permanentAddress ?? null,
      emergencyContactName: data.emergencyContactName ?? null,
      emergencyContactPhone: data.emergencyContactPhone ?? null,
      photoUrl: data.photoUrl ?? null,
      dob: data.dob,
      doj: data.doj,
      gender: data.gender,
      bloodGroup: data.bloodGroup ?? null,
      basicSalary: data.basicSalary,
      gorssSalary: data.gorssSalary,
      isActive: data.isActive ?? 1,
      empCode: data.empCode,
      departmentId: data.departmentId,
      designationId: data.designationId,
      employeeTypeId: data.employeeTypeId,
      createdBy: data.createdBy,
    })

    const employeeId = Number(result.lastInsertRowid)

    const employee = await tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })

    return employee
  })
}


//UPDATE
export const updateEmployee = async (
  employeeId: number,
  data: Partial<EmployeeDetails>
) => {
  return await db.transaction(async (tx) => {
    const existing = await tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })

    if (!existing) {
      throw new Error('Employee not found')
    }

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
        dob: data.dob ?? existing.dob,
        doj: data.doj ?? existing.doj,
        gender: data.gender ?? existing.gender,
        bloodGroup: data.bloodGroup ?? existing.bloodGroup,
        basicSalary: data.basicSalary ?? existing.basicSalary,
        gorssSalary: data.gorssSalary ?? existing.gorssSalary,
        isActive: data.isActive ?? existing.isActive,
        empCode: data.empCode ?? existing.empCode,
        departmentId: data.departmentId ?? existing.departmentId,
        designationId: data.designationId ?? existing.designationId,
        employeeTypeId: data.employeeTypeId ?? existing.employeeTypeId,
      })
      .where(eq(employeeModel.employeeId, employeeId))

    return await tx.query.employeeModel.findFirst({
      where: eq(employeeModel.employeeId, employeeId),
    })
  })
}


//GET ALL
export const getAllEmployees = async () => {
  return await db
    .select({
      employeeId: employeeModel.employeeId,
      fullName: employeeModel.fullName,
      email: employeeModel.email,
      officialPhone: employeeModel.officialPhone,
      personalPhone: employeeModel.personalPhone,
      gender: employeeModel.gender,
      empCode: employeeModel.empCode,
      basicSalary: employeeModel.basicSalary,
      gorssSalary: employeeModel.gorssSalary,
      isActive: employeeModel.isActive,
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


//GET ONE
export const getEmployeeById = async (employeeId: number) => {
  const employee = await db
    .select({
      employeeId: employeeModel.employeeId,
      fullName: employeeModel.fullName,
      email: employeeModel.email,
      officialPhone: employeeModel.officialPhone,
      personalPhone: employeeModel.personalPhone,
      presentAddress: employeeModel.presentAddress,
      permanentAddress: employeeModel.permanentAddress,
      emergencyContactName: employeeModel.emergencyContactName,
      emergencyContactPhone: employeeModel.emergencyContactPhone,
      photoUrl: employeeModel.photoUrl,
      dob: employeeModel.dob,
      doj: employeeModel.doj,
      gender: employeeModel.gender,
      bloodGroup: employeeModel.bloodGroup,
      basicSalary: employeeModel.basicSalary,
      gorssSalary: employeeModel.gorssSalary,
      isActive: employeeModel.isActive,
      empCode: employeeModel.empCode,
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
    .where(eq(employeeModel.employeeId, employeeId))

  return employee.length ? employee[0] : null
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
