import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createEmployee,
  updateEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
} from '../services/employees.service'

/* ================================
   CREATE EMPLOYEE
================================ */
export const createEmployeeController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'create_employee')

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[]
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`

    // Support bulk & single
    const payload = Array.isArray(req.body) ? req.body : [req.body]

    const results = []

    for (const item of payload) {
      const employeeDetails = typeof item === 'string' ? JSON.parse(item) : item

      // Handle photo upload
      if (files?.photoUrl?.[0]) {
        employeeDetails.photoUrl = `${baseUrl}${files.photoUrl[0].filename}`
      }

      const employee = await createEmployee(employeeDetails)
      results.push(employee)
    }

    res.status(201).json({
      success: true,
      data: Array.isArray(req.body) ? results : results[0],
    })
  } catch (error: any) {
    console.error('❌ Employee creation error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}

/* ================================
   UPDATE EMPLOYEE
================================ */
export const updateEmployeeController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'edit_employee')

    const employeeId = Number(req.params.id)
    if (!employeeId) {
      res.status(400).json({ error: 'Invalid employee ID' })
    }

    const employeeDetails =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[]
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`

    if (files?.photoUrl?.[0]) {
      employeeDetails.photoUrl = `${baseUrl}${files.photoUrl[0].filename}`
    }

    const updatedEmployee = await updateEmployee(employeeId, employeeDetails)

    res.json({ success: true, data: updatedEmployee })
  } catch (error: any) {
    console.error('❌ Employee update error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      })
    }
  }
}

/* ================================
   GET ALL EMPLOYEES
================================ */
export const getAllEmployeesController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_employee')

    const data = await getAllEmployees()
    res.json({ success: true, data })
  } catch (error) {
    console.error('Get All Employees Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

/* ================================
   GET EMPLOYEE BY ID
================================ */
export const getEmployeeByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_employee')

    const employeeId = Number(req.params.id)
    if (!employeeId) {
      res.status(400).json({ message: 'Invalid employee ID' })
    }

    const data = await getEmployeeById(employeeId)

    if (!data) {
      res
        .status(404)
        .json({ success: false, message: 'Employee not found' })
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('Get Employee By ID Error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}

/* ================================
   DELETE EMPLOYEE
================================ */
export const deleteEmployeeController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_employee')

    const employeeId = Number(req.params.id)
    if (!employeeId) {
      res.status(400).json({ message: 'Invalid employee ID' })
    }

    const result = await deleteEmployee(employeeId)
    res.status(200).json(result)
  } catch (error: any) {
    console.error('Delete Employee Error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    })
  }
}
