import mongoose, { Schema, Document, Model } from "mongoose";

export interface VendorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: string[];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: string[];
  ratings: number;
  foods: mongoose.Types.ObjectId[];
}

const VendorSchema = new Schema<VendorDoc>(
  {
    name: { type: String },
    ownerName: { type: String },
    foodType: { type: [String] },
    pincode: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    salt: { type: String },
    serviceAvailable: { type: Boolean },
    coverImages: { type: [String] },
    ratings: Number,
    foods: [{ type: mongoose.SchemaTypes.ObjectId, ref: "food" }],
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

const VendorModel: Model<VendorDoc> = mongoose.model("Vendor", VendorSchema);

export default VendorModel;
