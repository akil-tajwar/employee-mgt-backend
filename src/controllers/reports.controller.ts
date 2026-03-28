import { NextFunction, Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  employeeAttendanceReport,
  salaryReport,
} from '../services/reports.service'

// controller
export const employeeAttendanceReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_report')
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

// controller
export const salaryReportController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_report')
    const { salaryMonth, salaryYear } = req.query

    // Validate required query parameters
    if (!salaryMonth || !salaryYear) {
      res.status(400).json({
        success: false,
        message: 'salaryMonth and salaryYear are required',
      })
    }

    const data = await salaryReport(salaryMonth as string, Number(salaryYear))

    if (data.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No salary records found for the specified month and year',
        data: [],
        summary: {
          totalEmployees: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
        },
        filters: {
          salaryMonth,
          salaryYear: salaryYear,
        },
      })
    }

    // Calculate summary statistics
    const summary = {
      totalEmployees: data.length,
      totalGrossSalary: data.reduce(
        (sum, record) => sum + record.grossSalary,
        0
      ),
      totalNetSalary: data.reduce((sum, record) => sum + record.netSalary, 0),
      totalAllowances: data.reduce(
        (sum, record) => sum + record.totalAllowances,
        0
      ),
      totalDeductions: data.reduce(
        (sum, record) => sum + record.totalDeductions,
        0
      ),
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Salary report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary report',
    })
  }
}
