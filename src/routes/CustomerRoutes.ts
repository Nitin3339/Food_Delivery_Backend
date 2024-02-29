import express,{Request,Response,NextFunction} from 'express'
import { customerLogin, customerSignUp, customerVerify, editCustomerProfile, getCustomerProfile, requestOTP } from '../controller';
import { Authenticate } from '../middlewares';
const router= express.Router();


router.post('/signup',customerSignUp)



router.post('/login',customerLogin,)

router.use(Authenticate)
router.patch('/verify',customerVerify)


router.get('/otp',requestOTP)

router.get('/profile',getCustomerProfile)
router.patch('/profile',editCustomerProfile)


//Cart
//Order
//Payments



export {router as CustomerRoutes}