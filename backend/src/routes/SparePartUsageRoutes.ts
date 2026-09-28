import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", sparePartUsageController.list);
router.post("/", sparePartUsageController.create);
router.get("/stock", sparePartUsageController.listStock);
router.get("/stock-logs", sparePartUsageController.listStockLogs);
// 备件逐项审批与退回只对仓管开放。
router.post("/:id/approve", rbacMiddleware(["warehouse"]), sparePartUsageController.approve);
router.post("/:id/return", rbacMiddleware(["warehouse"]), sparePartUsageController.return);

export default router;
