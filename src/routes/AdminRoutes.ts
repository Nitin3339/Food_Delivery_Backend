import express,{Request,Response,NextFunction} from 'express'
import { CreateVendor, GetVendor, GetVendorByID } from '../controller/AdminController';

const router= express.Router();

router.post('/vendor',CreateVendor)
router.get('/vendor',GetVendor)
router.get('/vendor/:id',GetVendorByID)


export {router as AdminRoutes}