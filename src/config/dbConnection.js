import dotenv from 'dotenv'
dotenv.config();
import mongoose from "mongoose";

const connectDB  = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL).then(()=>{
            console.log("Connected to MongoDB successfully")
        })

    }catch(error){
        console.log(error.message)
    }
}

export default connectDB;