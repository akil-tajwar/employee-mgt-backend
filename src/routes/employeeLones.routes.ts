import { Router } from 'express'
import {
  createLoneController,
  getLonesController,
  updateLoneController,
  deleteLoneController,
} from '../controllers/employeeLones.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createLoneController)
router.get('/getAll', authenticateUser, getLonesController)
router.patch('/edit/:employeeLoneId', authenticateUser, updateLoneController)
router.delete('/delete/:employeeLoneId', authenticateUser, deleteLoneController)

export default router
