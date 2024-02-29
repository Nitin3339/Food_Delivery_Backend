import { Request, Response, NextFunction } from "express";
import { EditVendorProfile, VendorLogin } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility/PasswordUtility";
import { CrateFoodInput } from "../dto/Food.dto";
import Food from "../models/Food";


export const Login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = <VendorLogin>req.body
    const existingVendor = await findVendor('', email)
    if (existingVendor !== null) {
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt)
        if (validation) {
            const signature=GenerateSignature({
                _id:existingVendor.id,
                email:existingVendor.email,
                foodType:existingVendor.foodType,
                name:existingVendor.name
            })
            return res.json(signature)

        } else {
            return res.json({ 'message': "Password Not Valid" })
        }
    }
    return res.json({ 'message': "Login credential not valid" })
}

export const getVendorProfile= async (req: Request, res: Response, next: NextFunction) =>{
const user = req.user
if(user){
    const existingVendor= await findVendor(user._id)
    return res.json(existingVendor)
}
return res.json({'message':'No Vendor found'})
}

export const updateVendorProfile= async (req: Request, res: Response, next: NextFunction) =>{

    const {foodType,name,address,phone}=<EditVendorProfile>req.body
    const user = req.user
if(user){
    const existingVendor= await findVendor(user._id)
    if(existingVendor !==null){
        existingVendor.foodType=foodType;
        existingVendor.name=name;
        existingVendor.address=address;
        existingVendor.phone=phone
        const savedResult= await existingVendor.save()
        return res.json(savedResult)
    }
    return res.json(existingVendor)
}
return res.json({'message':'No Vendor found'})
    
}

export const uploadVendorProfilePic= async (req: Request, res: Response, next: NextFunction) =>{
    const user = req.user
    if(user){
       
        const vendor =await findVendor(user._id)
        if(vendor !==null){
    
            const file=req.files as [Express.Multer.File]
    
            const images=file.map((file:Express.Multer.File)=>file.filename)
            vendor.coverImages.push(...images);
            const result= await vendor.save();
            return res.json(result)
    
        }
        
    }
    return res.json({'message':'Something went wrong with add food'})
    
}

export const updateVendorService= async (req: Request, res: Response, next: NextFunction) =>{
    const user = req.user
if(user){
    const existingVendor= await findVendor(user._id)
    if(existingVendor !==null){
        existingVendor.serviceAvailable= !existingVendor.serviceAvailable
        const savedResult= await existingVendor.save()
        return res.json(savedResult)
    }
    return res.json(existingVendor)
}
return res.json({'message':'Service Cannot be updated At the Moment'})
    
}

export const addFood= async (req: Request, res: Response, next: NextFunction) =>{
    const user = req.user
if(user){
    const {name,description,category,foodType,readyTime,price}=<CrateFoodInput>req.body
    const vendor =await findVendor(user._id)
    if(vendor !==null){

        const file=req.files as [Express.Multer.File]

        const images=file.map((file:Express.Multer.File)=>file.filename)
        const createFood= await Food.create({
            vendorId:vendor._id,
            name:name,
            description:description,
            category:category,
            foodType:foodType,
            images:images,
            readyTime:readyTime,
            price:price,
            ratings:0
        })
        vendor.foods.push(createFood as any);
        const result= await vendor.save();
        return res.json(result)

    }
    
}
return res.json({'message':'Something went wrong with add food'})
    
}
export const getFoods= async (req: Request, res: Response, next: NextFunction) =>{
    const user = req.user
if(user){
    const foods= await Food.find({vendorId:user._id})
    if(foods !==null){
        return res.json(foods)
    }
    
}
return res.json({'message':'Something went wrong with get food'})
    
}