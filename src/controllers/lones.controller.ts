import { Request, Response, NextFunction } from 'express'
import {
  createLone,
  getLones,
  updateLone,
  deleteLone,
} from '../services/lones.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createLoneController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_lone')
    const { data } = req.body
    const lone = await createLone(data)
    res.status(201).json({ status: 'success', data: lone })
  } catch (err) {
    next(err)
  }
}

export const getLonesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_lone')
    const lones = await getLones()
    res.json(lones)
  } catch (err) {
    next(err)
  }
}

export const updateLoneController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_lone')
    const { loneId } = req.params

    const lone = await updateLone({ loneId: Number(loneId), ...req.body })
    res.json({ status: 'success', data: lone })
  } catch (err) {
    next(err)
  }
}

export const deleteLoneController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_lone')
    const { loneId } = req.params
    await deleteLone(Number(loneId))
    res.json({ status: 'success', message: 'Lone deleted' })
  } catch (err) {
    next(err)
  }
}
