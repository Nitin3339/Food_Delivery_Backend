import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import Vendor from "../models/Vendor"
import { GeneratePassword, GenerateSalt } from "../utility/PasswordUtility";


export const findVendor = async (id: string | undefined, email?: string) => {
    if (email) {
        return await Vendor.findOne({ email: email }).exec();
    } else {
        return await Vendor.findById(id).exec();
    }
};

export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body

    const existingVendor = await findVendor('', email)
    console.log("existingVendor", existingVendor)
    if (existingVendor) {
        return res.json({ "message": "A Vendor with the mail Id already Exist" })
    }
    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt)
    const createVendor = await Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt: salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods:[]
    })
    return res.json(createVendor)


}

export const GetVendor = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Vendor.find()
    if (data !== null) {
        return res.json(data)
    }
    return res.json({ "message": "No Vendor available" })
}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {
    const vendorID = req.params.id;
    const vendor = await findVendor(vendorID)
    if (vendor == null) {
        return res.json({ "message": "Vendor with the ID is not available" })
    }
    return res.json(vendor)
}