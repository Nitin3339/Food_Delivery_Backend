import { Request, Response, NextFunction } from "express";
import { EditVendorProfile, VendorLogin } from "../dto";
import { findVendor } from "./AdminController";
import {
  GenerateSignature,
  ValidatePassword,
} from "../utility/PasswordUtility";
import { CrateFoodInput } from "../dto/Food.dto";
import Food from "../models/Food";
import Order from "../models/Order";

export const Login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLogin>req.body;
  const existingVendor = await findVendor("", email);
  if (existingVendor !== null) {
    const validation = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );
    if (validation) {
      const signature = GenerateSignature({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodType: existingVendor.foodType,
        name: existingVendor.name,
      });
      return res.json(signature);
    } else {
      return res.json({ message: "Password Not Valid" });
    }
  }
  return res.json({ message: "Login credential not valid" });
};
export const getVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVendor = await findVendor(user._id);
    return res.json(existingVendor);
  }
  return res.json({ message: "No Vendor found" });
};
export const updateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { foodType, name, address, phone } = <EditVendorProfile>req.body;
  const user = req.user;
  if (user) {
    const existingVendor = await findVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.foodType = foodType;
      existingVendor.name = name;
      existingVendor.address = address;
      existingVendor.phone = phone;
      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  return res.json({ message: "No Vendor found" });
};
export const uploadVendorProfilePic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const vendor = await findVendor(user._id);
    if (vendor !== null) {
      const file = req.files as [Express.Multer.File];

      const images = file.map((file: Express.Multer.File) => file.filename);
      vendor.coverImages.push(...images);
      const result = await vendor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "Something went wrong with add food" });
};
export const updateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVendor = await findVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  return res.json({ message: "Service Cannot be updated At the Moment" });
};
export const addFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { name, description, category, foodType, readyTime, price } = <
      CrateFoodInput
    >req.body;
    const vendor = await findVendor(user._id);
    if (vendor !== null) {
      const file = req.files as [Express.Multer.File];

      const images = file.map((file: Express.Multer.File) => file.filename);
      const createFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        images: images,
        readyTime: readyTime,
        price: price,
        ratings: 0,
      });
      vendor.foods.push(createFood as any);
      const result = await vendor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "Something went wrong with add food" });
};
export const getFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await Food.find({ vendorId: user._id });
    if (foods !== null) {
      return res.json(foods);
    }
  }
  return res.json({ message: "Something went wrong with get food" });
};

export const getCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    if (orders !== null) {
      return res.json(orders);
    }
  }
  return res.json({ message: "Something Went Wrong" });
};
export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderID = req.params.id;
  if (orderID) {
    const orders = await Order.findById(orderID).populate("items.food");
    if (orders !== null) {
      return res.json(orders);
    }
  }
  return res.json({ message: "Something Went Wrong" });
};
export const processOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const { status, remark, time } = req.body;

    if (orderId) {
      const order = await Order.findById(orderId).populate("food");

      if (order) {
        order.orderStatus = status;
        order.remarks = remark;

        if (time) {
          order.readyTime = time;
        }

        const updatedOrder = await order.save();

        return res.json(updatedOrder);
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid order ID" });
    }
  } catch (error) {
    console.error("Error processing order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
