import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
const WAREHOUSE = ["WAREHOUSE_KEEPER"];

router.get("/", sparePartUsageController.list);
router.post("/", rbacMiddleware(WAREHOUSE), sparePartUsageController.create);
router.post("/:id/approve", rbacMiddleware(WAREHOUSE), sparePartUsageController.approve);
router.post("/:id/return", rbacMiddleware(WAREHOUSE), sparePartUsageController.return);

export default router;
