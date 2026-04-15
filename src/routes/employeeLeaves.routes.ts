import { Router } from 'express'
import {
  createEmployeeLeaveController,
  getEmployeeLeavesController,
  updateEmployeeLeaveController,
  deleteEmployeeLeaveController,
} from '../controllers/employeeLeaves.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createEmployeeLeaveController)
router.get('/getAll', authenticateUser, getEmployeeLeavesController)
router.patch('/edit/:employeeLeaveId', authenticateUser, updateEmployeeLeaveController)
router.delete('/delete/:employeeLeaveId', authenticateUser, deleteEmployeeLeaveController)

export default router
