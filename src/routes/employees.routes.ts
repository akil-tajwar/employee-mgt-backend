import express from 'express'
import { upload } from '../middlewares/upload'
import {
  createEmployeeController,
  updateEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  deleteEmployeeController,
} from '../controllers/employees.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = express.Router()

/* ================================
   CREATE EMPLOYEE
================================ */
router.post(
  '/create',
  upload.fields([
    { name: 'photoUrl', maxCount: 1 },
  ]),
  authenticateUser,
  createEmployeeController
)

/* ================================
   UPDATE EMPLOYEE
================================ */
router.patch(
  '/edit/:id',
  upload.fields([
    { name: 'photoUrl', maxCount: 1 },
  ]),
  authenticateUser,
  updateEmployeeController
)

/* ================================
   READ EMPLOYEES
================================ */
router.get('/getAll', authenticateUser, getAllEmployeesController)
router.get('/getById/:id', authenticateUser, getEmployeeByIdController)

/* ================================
   DELETE EMPLOYEE
================================ */
router.delete('/delete/:id', authenticateUser, deleteEmployeeController)

export default router
