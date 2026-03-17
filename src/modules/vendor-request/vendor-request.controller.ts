import { Request, Response, NextFunction } from "express";
import * as vendorRequestService from "./vendor-request.service.js";
import catchAsync from "../../utils/catch-async.js";
import AppError from "../../utils/app-error.js";
import { response } from "../../utils/response.util.js";
import "../../types/index.js";

export const submitRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { businessName, businessDescription } = req.body;

    if (!businessName || !businessDescription) {
      return next(new AppError("Business name and description are required", 400));
    }

    const request = await vendorRequestService.submitRequest(req.user!.id, {
      businessName,
      businessDescription,
    });

    response(res, 201, request);
  }
);

export const getAllRequests = catchAsync(async (_req: Request, res: Response) => {
  const requests = await vendorRequestService.findAll();
  response(res, 200, requests);
});

export const approveRequest = catchAsync(async (req: Request, res: Response) => {
  const user = await vendorRequestService.approveRequest(
    req.params.id as string,
    req.user!.id
  );
  response(res, 200, user);
});

export const rejectRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return next(new AppError("Rejection reason is required", 400));
    }

    const request = await vendorRequestService.rejectRequest(
      req.params.id as string,
      req.user!.id,
      rejectionReason
    );

    response(res, 200, request);
  }
);
