import { Request, Response, NextFunction } from 'express'
import {
  createSalary,
  getSalarys,
  updateSalary,
  deleteSalary,
} from '../services/salary.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createSalaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_leave_type')

    const salarys = await createSalary(req.body)

    res.status(201).json({
      status: 'success',
      data: salarys,
    })
  } catch (err) {
    next(err)
  }
}

export const getSalarysController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_leave_type')
    const salarys = await getSalarys()
    res.json(salarys)
  } catch (err) {
    next(err)
  }
}

export const updateSalaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_leave_type')

    const { salaryId } = req.params

    const salary = await updateSalary(Number(salaryId), req.body)

    res.json({
      status: 'success',
      data: salary,
    })
  } catch (err) {
    next(err)
  }
}

export const deleteSalaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_leave_type')
    const { salaryId } = req.params
    await deleteSalary(Number(salaryId))
    res.json({ status: 'success', message: 'Leave type deleted' })
  } catch (err) {
    next(err)
  }
}
