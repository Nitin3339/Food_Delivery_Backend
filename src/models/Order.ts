import mongoose, { Schema, Document, Model } from "mongoose";

export interface OrderDoc extends Document {
  orderID: string;
  VendorId: string;
  items: [any];
  totalAmount: number;
  orderDate: Date;
  paidThrough: string;
  paymentResponse: string;
  orderStatus: string;
  remarks: string;
  deliveryId: string;
  appliedOffers: boolean;
  offerId: string;
  readyTime: number;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    orderID: { type: String },
    VendorId: { type: String },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food" },
        unit: { type: Number },
      },
    ],
    totalAmount: { type: Number },
    orderDate: { type: Date },
    paidThrough: { type: String },
    paymentResponse: { type: String },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    appliedOffers: { type: Boolean },
    offerId: { type: String },
    readyTime: { type: Number },
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

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export default Order;
