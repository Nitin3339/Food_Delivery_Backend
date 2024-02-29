import express, { Request, Response, NextFunction } from "express";
import {
  GetFoodAvailability,
  GetFoodIn30Min,
  GetTopRestaurants,
  RestaurantsById,
  SearchFoods,
} from "../controller";

const router = express.Router();

//-------Food Availabilty
router.get("/:pincode", GetFoodAvailability);

//-----Top Restaurants
router.get("/top-restaurants/:pincode", GetTopRestaurants);

//------Foods Available in 30mnts
router.get("/foods-in-30-min/:pincode", GetFoodIn30Min);
//--------Search Foods
router.get("/search/:pincode", SearchFoods);
//-------FInd Restaurant by ID
router.get("/restaurants/:pincode", RestaurantsById);

export { router as ShoppingRoutes };
