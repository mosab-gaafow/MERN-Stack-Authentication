import mongoose from "mongoose"

export const connectDB = async () => {

    try{
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);

    }catch(e){
        console.log("error connecting to mongoDB", e.message);
        process.exit(1);
    }
}