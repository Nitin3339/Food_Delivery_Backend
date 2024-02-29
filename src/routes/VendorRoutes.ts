import express,{Request,Response,NextFunction} from 'express'
import { Login, addFood, getFoods, getVendorProfile, updateVendorProfile, updateVendorService, uploadVendorProfilePic } from '../controller';
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router= express.Router();

const imageStorage=multer.diskStorage({
    destination(req, file, callback) {
        callback(null,'images')
    },
    filename(req, file, callback) {
        callback(null, new Date().toISOString+'_'+file.originalname)
    },
})

const images=multer({storage:imageStorage}).array('images',10)

router.post('/login',Login)
router.use(Authenticate)
router.get('/profile',getVendorProfile)
router.patch('/profile',updateVendorProfile)
router.patch('/service',updateVendorService)
router.patch('/coverimage',images,uploadVendorProfilePic)

router.post('/food',images,addFood)
router.get('/foods',getFoods)


export {router as VendorRoutes}