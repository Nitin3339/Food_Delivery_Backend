import express, { Request, Response, NextFunction } from "express";
import { VendorDoc, FoodDoc } from "../models";
import VendorModel from "../models/Vendor";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await VendorModel.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "No Food Available Found" });
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  const result = await VendorModel.find({
    pincode: pincode,
    serviceAvailable: true,
  })
    .sort([["rating", "descending"]])
    .limit(10);

  if (result.length > 0) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "No Top Restaurants" });
};

export const GetFoodIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  try {
    const results = await VendorModel.find({
      pincode: pincode,
      serviceAvailable: false,
    }).populate({
      path: "foods",
      match: { readyTime: { $lt: 5 } },
    });
    const filteredResults = results.filter((result) => result.foods.length > 0);

    return res.json(filteredResults);
  } catch (error) {
    console.error("Error in GetFoodIn30Min:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;
  console.log("pincode", pincode);

  try {
    const results = await VendorModel.find({
      pincode: pincode,
      serviceAvailable: false,
    }).populate("foods");
    if (results.length > 0) {
      let foodResult: any = [];
      results.map((item) => foodResult.push(...item.foods));
      return res.json(foodResult);
    }
  } catch (error) {
    console.error("Error in GetFoodIn30Min:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const RestaurantsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const result = await VendorModel.findById(id).populate("foods");

  if (result) {
    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "No Restaurant found" });
};
