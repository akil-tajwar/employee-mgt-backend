import { Router } from 'express'

import { employeeAttendanceReportController, salaryReportController } from '../controllers/reports.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.get('/attendance-report', authenticateUser, employeeAttendanceReportController)
router.get('/salary-report', authenticateUser, salaryReportController)

export default router
