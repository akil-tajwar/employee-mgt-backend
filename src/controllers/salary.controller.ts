import { Request, Response, NextFunction } from 'express'
import {
  createSalaryWithOtherSalaryComponents,
  getSalarys,
  updateSalaryWithOtherSalaryComponents,
  deleteSalaryWithOtherSalaryComponents,
} from '../services/salary.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createSalaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_salary')

    const result = await createSalaryWithOtherSalaryComponents(req.body)

    res.status(201).json({
      status: 'success',
      data: result,
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
    requirePermission(req, 'view_salary')
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
    requirePermission(req, 'edit_salary')

    const { salaryId } = req.params

    const result = await updateSalaryWithOtherSalaryComponents(
      Number(salaryId),
      req.body
    )

    res.json({
      status: 'success',
      data: result,
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
    requirePermission(req, 'delete_salary')

    const { salaryId } = req.params

    await deleteSalaryWithOtherSalaryComponents(Number(salaryId))

    res.json({
      status: 'success',
      message: 'Salary deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}