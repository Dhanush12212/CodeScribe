import mongoose from "mongoose";


//Connecting to the DB
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(
            JSON.stringify({
                message: "Connected to DB",
                status: "success"
            })
        );
    } catch(error) {
        console.error(
            JSON.stringify({
                message: "Failed to Connect to DB",
                status: "Failed",
                error: error.message,
            })
        )
        process.exit(1); 
    }
}

export default connectDB;