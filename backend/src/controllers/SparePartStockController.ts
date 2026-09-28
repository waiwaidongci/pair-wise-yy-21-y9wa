import type { Request, Response, NextFunction } from "express";
import { sparePartStockService } from "../services/SparePartStockService";
import { controllerError } from "../utils/httpError";

export const sparePartStockController = {
  list: (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(sparePartStockService.list());
    } catch (error) {
      next(controllerError(error));
    }
  }
};
