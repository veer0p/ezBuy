import express, { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { controllerType } from "../types/types.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statuscode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";
  return res.status(err.statuscode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch =
  (func: controllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
