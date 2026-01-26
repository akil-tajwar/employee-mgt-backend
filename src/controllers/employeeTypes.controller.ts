import { Request, Response, NextFunction } from 'express'
import {
  createEmployeeType,
  getEmployeeTypes,
  updateEmployeeType,
  deleteEmployeeType,
} from '../services/employeeTypes.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createEmployeeTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_employeeTypes')
    const { name } = req.body
    const employeeType = await createEmployeeType(name)
    res.status(201).json({ status: 'success', data: employeeType })
  } catch (err) {
    next(err)
  }
}

export const getEmployeeTypesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_employeeTypes')
    const employeeTypes = await getEmployeeTypes()
    res.json({ status: 'success', data: employeeTypes })
  } catch (err) {
    next(err)
  }
}

export const updateEmployeeTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_employeeTypes')
    const { employeeTypeId } = req.params
    const { name } = req.body

    const employeeType = await updateEmployeeType(Number(employeeTypeId), name)
    res.json({ status: 'success', data: employeeType })
  } catch (err) {
    next(err)
  }
}

export const deleteEmployeeTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_employeeTypes')
    const { employeeTypeId } = req.params
    await deleteEmployeeType(Number(employeeTypeId))
    res.json({ status: 'success', message: 'EmployeeType deleted' })
  } catch (err) {
    next(err)
  }
}
