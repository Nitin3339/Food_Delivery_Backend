import { Request, NextFunction, Response } from "express";
import { AuthPayload } from "../dto/Auth.dto";
import { ValidateSignature } from "../utility/PasswordUtility";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validate = await ValidateSignature(req as any);

  if (validate) {
    next();
  } else {
    return res.json({ message: "Invalid Authorization" });
  }
};
