import { Router } from 'express'

import { employeeAttendanceReportController } from '../controllers/reports.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.get('/attendance-report', authenticateUser, employeeAttendanceReportController)

export default router
