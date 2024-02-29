import express,{Application} from 'express'
import {AdminRoutes,VendorRoutes,ShoppingRoutes,CustomerRoutes} from '../routes'
import path from 'path'

export default async(app:Application)=>{
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    
    app.use('/admin',AdminRoutes)
    app.use('/vendor',VendorRoutes)
    app.use('/shopping',ShoppingRoutes)
    app.use('/customer',CustomerRoutes)
    app.use('/images',express.static(path.join(__dirname,'images')))
    return app;
}


