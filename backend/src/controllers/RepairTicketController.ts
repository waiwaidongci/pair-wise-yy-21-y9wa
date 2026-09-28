import type { Request, Response, NextFunction } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { controllerError } from "../utils/httpError";

export const repairTicketController = {
  list: (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.list());
    } catch (error) {
      next(controllerError(error));
    }
  },

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(repairTicketService.create(req.body));
    } catch (error) {
      next(controllerError(error));
    }
  },

  restore: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.restore(Number(req.params.id)));
    } catch (error) {
      next(controllerError(error));
    }
  }
};
