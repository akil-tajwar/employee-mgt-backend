import { Router } from 'express'
import authRoutes from './auth.routes'
import departmentsRoutes from './departments.routes'
import designationsRoutes from './designations.routes'
import employeeTypeRoutes from './employeeTypes.routes'
import weekendRoutes from './weekends.routes'
import employeeRoutes from './employees.routes'
import officeTimingRoutes from './officeTimings.routes'
import holidayRoutes from './holidays.routes'
import leaveTypeRoutes from './leaveTypes.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/departments', departmentsRoutes)
router.use('/designations', designationsRoutes)
router.use('/employeeTypes', employeeTypeRoutes)
router.use('/weekends', weekendRoutes)
router.use('/employees', employeeRoutes)
router.use('/officeTimings', officeTimingRoutes)
router.use('/holidays', holidayRoutes)
router.use('/leaveTypes', leaveTypeRoutes)

export default router
