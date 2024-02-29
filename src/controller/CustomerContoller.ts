import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
} from "../dto/Customer.dto";
import { IsEmail, Validate, validate } from "class-validator";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility/PasswordUtility";
import { generateOTP, onRequestOTP } from "../utility/NotificationUtility";
import CustomerModel from "../models/Customer";
import Food from "../models/Food";
import Order from "../models/Order";

export const customerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToInstance(CreateCustomerInputs, req.body);
  const inputError = await validate(customerInputs, {
    validationError: { target: true },
  });
  if (inputError.length > 0) {
    return res.status(400).json(inputError);
  }
  const { email, phone, password } = customerInputs;
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);
  const { otp, expiry } = generateOTP();
  const existingCustomer = await CustomerModel.find({ email: email });
  if (existingCustomer) {
    return res.json({ message: "Customer Already Exist" });
  }
  const result = await CustomerModel.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    otp: otp,
    otp_expiry: expiry,
    firstName: "",
    lastName: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
    orders: [],
  });
  if (result) {
    await onRequestOTP(otp, phone);
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    return res.json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }
  return res.json({ message: "something went wrong" });
};

export const customerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToInstance(UserLoginInputs, req.body);
  const loginError = await validate(loginInputs, {
    validationError: { target: false },
  });
  if (loginError.length > 0) {
    return res.json({ message: "something went wrong" });
  }
  const { email, password } = loginInputs;
  const customer = await CustomerModel.findOne({ email: email });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });
      return res.json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }
  return res.json({ message: "Login Error" });
};

export const customerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedCustomerResponse = await profile.save();
        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });
        return res.json({
          signature: signature,
          verified: updatedCustomerResponse.verified,
          email: updatedCustomerResponse.email,
        });
      }
    }
  }
  return res.json({ message: "something went wrong" });
};

export const requestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id);
    if (profile) {
      const { otp, expiry } = generateOTP();
      profile.otp = otp;
      profile.otp_expiry = expiry;
      await profile.save();
      await onRequestOTP(otp, profile.phone);

      return res.json({ message: "OTP Delivered" });
    }
  }
  return res.json({ message: "something went wrong" });
};

export const editCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const profileInputs = plainToInstance(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });
  if (profileErrors.length > 0) {
    return res.json(profileErrors);
  }
  const { firstName, lastName, address } = profileInputs;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();
      return res.json(result);
    }
  }
};

export const getCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id);
    if (profile) {
      return res.json(profile);
    }
  }
  return res.json({ message: "Something Went Wrong" });
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;

    if (customer) {
      const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
      const profile = await CustomerModel.findById(customer._id);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const cart = req.body as OrderInputs[];
      let cartItems: { food: any; unit: number }[] = [];
      let netAmount = 0.0;

      const foods = await Food.find()
        .where("_id")
        .in(cart.map((item) => item._id))
        .exec();

      foods.forEach((food) => {
        cart.forEach(({ _id, unit }) => {
          if (food._id.equals(_id)) {
            netAmount += food.price * unit;
            cartItems.push({ food, unit });
          }
        });
      });

      const currentOrder = await Order.create({
        orderID: orderId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "Waiting",
        remarks: "",
        deliveryId: "",
        appliedOffers: false,
        offerId: null,
        readyTime: 45,
      });
      profile.cart = [] as any;

      if (currentOrder) {
        profile.orders.push(currentOrder);
        const profileResponse = await profile.save();
        return res.status(201).json(profileResponse);
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong while creating the order" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id).populate(
      "orders"
    );
    if (profile) {
      return res.json(profile.orders);
    }
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    return res.json(order);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (!customer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await CustomerModel.findById(customer._id).populate(
      "cart.food"
    );
    let cartItems = [];

    const { _id, unit } = req.body as OrderInputs;
    const food = await Food.findById(_id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    if (profile !== null) {
      cartItems = profile.cart;

      if (cartItems.length > 0) {
        const existingFoodItem = cartItems.find((item) =>
          item.food._id.equals(_id)
        );

        if (existingFoodItem) {
          existingFoodItem.unit += unit;
        } else {
          cartItems.push({ food: food, unit: unit });
        }
      } else {
        cartItems.push({ food: food, unit: unit });
      }

      profile.cart = cartItems;

      const updatedProfile = await profile.save();

      return res.status(200).json(updatedProfile);
    } else {
      return res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id).populate(
      "cart.food"
    );
    if (profile) {
      return res.json(profile.cart);
    }
  }
  return res.json({ message: "Something went wrong" });
};

export const deleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await CustomerModel.findById(customer._id).populate(
      "cart.food"
    );
    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();
      return res.json(cartResult);
    }
  }
  return res.json({ message: "Something went wrong" });
};
