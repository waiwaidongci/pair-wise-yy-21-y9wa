import { Router } from "express";
import { sparePartStockController } from "../controllers/SparePartStockController";

const router = Router();
router.get("/", sparePartStockController.list);

export default router;
