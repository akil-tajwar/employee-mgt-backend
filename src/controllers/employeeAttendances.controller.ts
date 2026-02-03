import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { employeeAttendanceModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createEmployeeAttendance,
  deleteEmployeeAttendance,
  editEmployeeAttendance,
  getAllEmployeeAttendances,
  getEmployeeAttendanceById,
} from '../services/employeeAttendances.service'

// Schema validation
const createEmployeeAttendanceSchema = createInsertSchema(employeeAttendanceModel).omit({
  employeeAttendanceId: true,
})

const editEmployeeAttendanceSchema = createEmployeeAttendanceSchema.partial()

export const createEmployeeAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_employee_attendance')
    const employeeAttendanceData = createEmployeeAttendanceSchema.parse(req.body)
    console.log("🚀 ~ createEmployeeAttendanceController ~ employeeAttendanceData:", employeeAttendanceData)
    const employeeAttendance = await createEmployeeAttendance(employeeAttendanceData)

    res.status(201).json({
      status: 'success',
      data: employeeAttendance,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllEmployeeAttendancesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_employee_attendance')
    const employeeAttendances = await getAllEmployeeAttendances()

    res.status(200).json(employeeAttendances)
  } catch (error) {
    next(error)
  }
}

export const getEmployeeAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_employee_attendance')
    const id = Number(req.params.id)
    const employeeAttendance = await getEmployeeAttendanceById(id)

    res.status(200).json(employeeAttendance)
  } catch (error) {
    next(error)
  }
}

export const editEmployeeAttendanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_employee_attendance')
    const id = Number(req.params.id)
    const employeeAttendanceData = editEmployeeAttendanceSchema.parse(req.body)
    const employeeAttendance = await editEmployeeAttendance(id, employeeAttendanceData)

    res.status(200).json(employeeAttendance)
  } catch (error) {
    next(error)
  }
}

export const deleteEmployeeAttendanceController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_employee_attendance')
    const employeeAttendanceId = Number(req.params.id);

    const result = await deleteEmployeeAttendance(employeeAttendanceId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
