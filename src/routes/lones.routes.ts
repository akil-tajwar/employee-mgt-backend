import { Router } from 'express'
import {
  createLoneController,
  getLonesController,
  updateLoneController,
  deleteLoneController,
} from '../controllers/lones.controller'
import { authenticateUser } from '../middlewares/auth.middleware'

const router = Router()

router.post('/create', authenticateUser, createLoneController)
router.get('/getAll', authenticateUser, getLonesController)
router.patch('/edit/:loneId', authenticateUser, updateLoneController)
router.delete('/delete/:loneId', authenticateUser, deleteLoneController)

export default router
