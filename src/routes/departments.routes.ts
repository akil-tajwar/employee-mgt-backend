import { Router } from 'express'
import {
  createDepartmentController,
  getDepartmentsController,
  updateDepartmentController,
  deleteDepartmentController,
} from '../controllers/departments.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createDepartmentController)
router.get('/getAll', authenticateUser, getDepartmentsController)
router.put('/edit/:departmentId', authenticateUser, updateDepartmentController)
router.delete('/delete/:departmentId', authenticateUser, deleteDepartmentController)

export default router
