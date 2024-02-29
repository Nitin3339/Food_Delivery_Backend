//email
//notification
//otp

export const generateOTP=()=>{
    const otp=Math.floor(100000 + Math.random()*900000)
    let expiry= new Date()
    expiry.setTime(new Date().getTime()+(30*60*1000))

    return {otp,expiry}
}

export const onRequestOTP= async(otp:number,toPhoneNumber:string)=>{
    const accountSID='AC531395b7b03182d29f0cf66f907a6e69'
    const authToken='21c8b5f6c8eaaacef63a8424f820634b'
    const client = require('twilio')(accountSID,authToken)

    const response = await client.messages.create({
        body:`Your OTP is ${otp}`,
        from:'9195556767903',
        to:toPhoneNumber
        })
        return response

}
//payment notification or email