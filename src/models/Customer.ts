import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OrderDoc } from "./Order";

export interface CustomerDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
  cart: [any];
  orders: [OrderDoc];
}

const CustomerSchema = new Schema<CustomerDoc>(
  {
    email: { type: String },
    password: { type: String },
    salt: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    phone: { type: String },
    verified: { type: Boolean },
    otp: { type: Number },
    otp_expiry: { type: Date },
    lat: { type: Number },
    lng: { type: Number },
    cart: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    orders: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food" },
        unit: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

const CustomerModel: Model<CustomerDoc> = mongoose.model(
  "Customer",
  CustomerSchema
);

export default CustomerModel;
