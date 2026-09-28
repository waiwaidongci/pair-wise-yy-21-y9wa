import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", repairTicketController.list);
router.post("/", repairTicketController.create);
// 复电确认只对抢修班组长开放。
router.post("/:id/restore", rbacMiddleware(["leader"]), repairTicketController.restorePower);

export default router;
