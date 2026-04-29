import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  employeeAttendanceReport,
  loneReport,
  salaryReport,
} from '../services/reports.service'

export const employeeAttendanceReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_attendance_report')
    const { fromDate, toDate } = req.query

    // Validate required query parameters
    if (!fromDate || !toDate) {
      res.status(400).json({
        success: false,
        message: 'fromDate and toDate are required',
      })
    }

    const data = await employeeAttendanceReport(
      fromDate as string,
      toDate as string
    )

    res.status(200).json(data)
  } catch (error) {
    console.error('Attendance report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance report',
    })
  }
}

export const salaryReportController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_salary_report')
    const { salaryMonth, salaryYear } = req.query

    // Validate required query parameters
    if (!salaryMonth || !salaryYear) {
      res.status(400).json({
        success: false,
        message: 'salaryMonth and salaryYear are required',
      })
    }

    const data = await salaryReport(salaryMonth as string, Number(salaryYear))

    res.status(200).json(data)
  } catch (error) {
    console.error('Salary report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary report',
    })
  }
}

export const loneReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_lone_report')

    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      })
    }

    const data = await loneReport(
      startDate as string,
      endDate as string
    )

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Lone report error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lone report',
    })
  }
}