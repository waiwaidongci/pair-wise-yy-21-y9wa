import type { Request, Response, NextFunction } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { controllerError } from "../utils/httpError";

const parseId = (req: Request) => Number(req.params.id);

export const sparePartUsageController = {
  list: (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticketId = req.query.ticket_id ? Number(req.query.ticket_id) : undefined;
      res.json(typeof ticketId === "number" && Number.isInteger(ticketId)
        ? sparePartUsageService.listByTicket(ticketId)
        : sparePartUsageService.list());
    } catch (error) {
      next(controllerError(error));
    }
  },

  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(sparePartUsageService.create(req.body));
    } catch (error) {
      next(controllerError(error));
    }
  },

  approve: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(sparePartUsageService.approve(parseId(req), req.body));
    } catch (error) {
      next(controllerError(error));
    }
  },

  return: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(sparePartUsageService.return(parseId(req), req.body));
    } catch (error) {
      next(controllerError(error));
    }
  }
};
