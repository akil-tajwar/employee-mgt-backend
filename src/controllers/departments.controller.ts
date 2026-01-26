import { Request, Response, NextFunction } from 'express'
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from '../services/departments.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createDepartmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    requirePermission(req, 'delete_departments')
    const { name } = req.body
    const department = await createDepartment(name)
    res.status(201).json({ status: 'success', data: department })
  } catch (err) {
    next(err)
  }
}

export const getDepartmentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    requirePermission(req, 'delete_departments')
    const departments = await getDepartments()
    res.json({ status: 'success', data: departments })
  } catch (err) {
    next(err)
  }
}

export const updateDepartmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    requirePermission(req, 'delete_departments')
    const { departmentId } = req.params
    const { name } = req.body

    const department = await updateDepartment(Number(departmentId), name)
    res.json({ status: 'success', data: department })
  } catch (err) {
    next(err)
  }
}

export const deleteDepartmentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    requirePermission(req, 'delete_departments')
    const { departmentId } = req.params
    await deleteDepartment(Number(departmentId))
    res.json({ status: 'success', message: 'Department deleted' })
  } catch (err) {
    next(err)
  }
}
