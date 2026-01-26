import { Router } from "express";
import authRoutes from "./auth.routes";
import departmentsRoutes from "./departments.routes";
import designationsRoutes from "./designations.routes";

const router=Router()

router.use('/auth',authRoutes)
router.use('/departments',departmentsRoutes)
router.use('/designations',designationsRoutes)

export default router;