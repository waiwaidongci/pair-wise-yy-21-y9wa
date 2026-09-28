import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", repairTicketController.list);
router.post("/", rbacMiddleware(["DISPATCHER"]), repairTicketController.create);
// Only the repair crew leader confirms restoration.
router.post("/:id/restore", rbacMiddleware(["LEADER"]), repairTicketController.restore);

export default router;
