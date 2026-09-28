import type { Request, Response, NextFunction } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { BusinessError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";

export const repairTicketController = {
  list: (_req: Request, res: Response) => res.json(repairTicketService.list()),

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(repairTicketService.create(req.body));
    } catch (err) {
      if (err instanceof BusinessError) {
        next(new BusinessError(err.code, `[RepairTicketController] ${err.message}`, err.status, err.details));
      } else {
        next(new BusinessError(ERROR_CODES.VALIDATION_FAILED, `[RepairTicketController] ${String(err)}`, 400));
      }
    }
  },

  restorePower: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      res.json(repairTicketService.restorePower(id));
    } catch (err) {
      if (err instanceof BusinessError) {
        next(new BusinessError(err.code, `[RepairTicketController] ${err.message}`, err.status, err.details));
      } else {
        next(new BusinessError(ERROR_CODES.VALIDATION_FAILED, `[RepairTicketController] ${String(err)}`, 400));
      }
    }
  }
};
