import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { assignComplaint, listUsers, updateUserRole, analytics } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(auth, authorize("admin"));

router.patch("/complaints/:id/assign", assignComplaint);
router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/analytics", analytics);

export default router;

