import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { CreateCustomerInputs, UserLoginInputs, EditCustomerProfileInputs } from "../dto/Customer.dto";
import { IsEmail, Validate, validate } from "class-validator";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword} from "../utility/PasswordUtility";
import{generateOTP, onRequestOTP } from "../utility/NotificationUtility"
import CustomerModel from "../models/Customer";


export const customerSignUp = async (req: Request, res: Response, next: NextFunction) => {
    const customerInputs = plainToInstance(CreateCustomerInputs, req.body)
    const inputError = await validate(customerInputs, { validationError: { target: true } })
    if (inputError.length > 0) {
        return res.status(400).json(inputError)
    }
    const { email, phone, password } = customerInputs
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt)
    const { otp, expiry } = generateOTP();
    const existingCustomer = await CustomerModel.find({ email: email })
    if (existingCustomer) {
        return res.json({ 'message': "Customer Already Exist" })
    }
    const result = await CustomerModel.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0
    })
    if (result) {
        await onRequestOTP(otp, phone)
        const signature = GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        return res.json({ signature: signature, verified: result.verified, email: result.email, })
    }
    return res.json({ 'message': "something went wrong" })
}


export const customerLogin = async (req: Request, res: Response, next: NextFunction) => {
    const loginInputs = plainToInstance(UserLoginInputs, req.body)
    const loginError = await validate(loginInputs, { validationError: { target: false } })
    if (loginError.length > 0) {
        return res.json({ 'message': "something went wrong" })
    }
    const { email, password } = loginInputs
    const customer = await CustomerModel.findOne({ email: email })
    if (customer) {
        const validation = await ValidatePassword(password, customer.password, customer.salt)
        if (validation) {
            const signature = GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })
            return res.json({ signature: signature, verified: customer.verified, email: customer.email, })
        }
    }
    return res.json({ 'message': "Login Error" })
}


export const customerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body
    const customer = req.user
    if (customer) {
        const profile = await CustomerModel.findById(customer._id)
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                const updatedCustomerResponse = await profile.save();
                const signature = GenerateSignature({
                    _id: updatedCustomerResponse._id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                })
                return res.json({ signature: signature, verified: updatedCustomerResponse.verified, email: updatedCustomerResponse.email, })
            }
        }
    }
    return res.json({ 'message': "something went wrong" })
}


export const requestOTP = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user;
    if (customer) {
        const profile = await CustomerModel.findById(customer._id)
        if (profile) {
            const { otp, expiry } = generateOTP();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            await profile.save();
            await onRequestOTP(otp, profile.phone)

            return res.json({ 'message': "OTP Delivered" })
        }
    }
    return res.json({ 'message': "something went wrong" })
}


export const editCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user
    const profileInputs = plainToInstance(EditCustomerProfileInputs, req.body)
    const profileErrors = await validate(profileInputs, { validationError: { target: false } })
    if (profileErrors.length > 0) {
        return res.json(profileErrors)
    }
    const { firstName, lastName, address } = profileInputs
    if (customer) {
        const profile = await CustomerModel.findById(customer._id)
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;

            const result = await profile.save();
            return res.json(result)
        }
    }

}


export const getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user
    if (customer) {
        const profile = await CustomerModel.findById(customer._id)
        if (profile) {
            return res.json(profile)
        }
    }
    return res.json({ 'message': 'Something Went Wrong' })
}


