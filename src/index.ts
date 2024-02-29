import express from 'express'
import App from './services/Express'
import dbConnection from './services/Database'
import { PORT } from './config'

const startServer = async () => {
    const app=express()

    await dbConnection()

    await App(app)

    app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
    })
}

startServer()