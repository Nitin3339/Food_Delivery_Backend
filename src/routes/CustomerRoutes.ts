import express, { Request, Response, NextFunction } from "express";
import {
  createOrder,
  customerLogin,
  customerSignUp,
  customerVerify,
  editCustomerProfile,
  getCustomerProfile,
  getOrder,
  getOrderById,
  requestOTP,
  addToCart,
  deleteCart,
  getCart,
} from "../controller";
import { Authenticate } from "../middlewares";
const router = express.Router();

router.post("/signup", customerSignUp);
router.post("/login", customerLogin);

router.use(Authenticate);
router.patch("/verify", customerVerify);
router.get("/otp", requestOTP);
router.get("/profile", getCustomerProfile);
router.patch("/profile", editCustomerProfile);

//Cart
router.post("/cart", addToCart);
router.get("/cart", getCart);
router.delete("/cart", deleteCart);
//Order
router.post("/create-order", createOrder);
router.get("/orders", getOrder);
router.get("/order/:id", getOrderById);
//Payments

export { router as CustomerRoutes };
