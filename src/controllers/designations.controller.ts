import { Request, Response, NextFunction } from 'express'
import {
  createDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
} from '../services/designations.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createDesignationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_designations')
    const { name } = req.body
    const designation = await createDesignation(name)
    res.status(201).json({ status: 'success', data: designation })
  } catch (err) {
    next(err)
  }
}

export const getDesignationsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'get_designations')
    const designations = await getDesignations()
    res.json({ status: 'success', data: designations })
  } catch (err) {
    next(err)
  }
}

export const updateDesignationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_designations')
    const { designationId } = req.params
    const { name } = req.body

    const designation = await updateDesignation(Number(designationId), name)
    res.json({ status: 'success', data: designation })
  } catch (err) {
    next(err)
  }
}

export const deleteDesignationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'delete_designations')
    const { designationId } = req.params
    await deleteDesignation(Number(designationId))
    res.json({ status: 'success', message: 'Designation deleted' })
  } catch (err) {
    next(err)
  }
}
