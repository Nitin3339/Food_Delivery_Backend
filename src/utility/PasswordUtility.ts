import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { VendorPayload } from "../dto";
import { APP_SECRET } from "../config";
import { AuthPayload } from "../dto/Auth.dto";
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = (payload: AuthPayload) => {
  const signature = jwt.sign(payload, APP_SECRET, { expiresIn: "1d" });
  return signature;
};

export const ValidateSignature = async (req: Request) => {
  const signature = (req as any).headers.authorization;
  if (signature) {
    const token = signature.split(" ")[1];
    try {
      const payload = (await jwt.verify(token, APP_SECRET)) as AuthPayload;
      (req as any).user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
};
