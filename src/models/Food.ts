import mongoose, { Schema, Document, Model } from "mongoose";

export interface FoodDoc extends Document {
  vendorId: string;
  name: string;
  description: string;
  category: string;
  foodType: string;
  readyTime: number;
  price: number;
  ratings: number;
  images: [string];
}

const FoodSchema = new Schema<FoodDoc>(
  {
    vendorId: { type: String },
    name: { type: String },
    description: { type: String },
    category: { type: String },
    foodType: { type: String },
    readyTime: { type: Number },
    price: { type: Number },
    ratings: { type: Number },
    images: { type: [String] },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._v, delete ret.createdAt, delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Food = mongoose.model<FoodDoc>("food", FoodSchema);

export default Food;
