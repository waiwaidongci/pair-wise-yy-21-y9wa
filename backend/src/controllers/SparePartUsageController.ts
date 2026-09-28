import type { Request, Response, NextFunction } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { BusinessError } from "../utils/AppError";
import { ERROR_CODES } from "../constants/errorCodes";

const parseTicketId = (req: Request): number | undefined => {
  const raw = req.query.ticket_id;
  if (raw === undefined || raw === "") return undefined;
  const num = Number(raw);
  return Number.isInteger(num) ? num : undefined;
};

const wrap = (err: unknown): BusinessError => {
  if (err instanceof BusinessError) {
    return new BusinessError(err.code, `[SparePartUsageController] ${err.message}`, err.status, err.details);
  }
  return new BusinessError(ERROR_CODES.VALIDATION_FAILED, `[SparePartUsageController] ${String(err)}`, 400);
};

export const sparePartUsageController = {
  list: (req: Request, res: Response) => res.json(sparePartUsageService.list(parseTicketId(req))),

  listStock: (_req: Request, res: Response) => res.json(sparePartUsageService.listStock()),

  listStockLogs: (req: Request, res: Response) =>
    res.json(sparePartUsageService.listStockLogs(parseTicketId(req))),

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(sparePartUsageService.create(req.body));
    } catch (err) {
      next(wrap(err));
    }
  },

  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      res.json(sparePartUsageService.approve(id, req.body ?? {}));
    } catch (err) {
      next(wrap(err));
    }
  },

  return: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      res.json(sparePartUsageService.return(id));
    } catch (err) {
      next(wrap(err));
    }
  }
};
