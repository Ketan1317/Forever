import mongoose from "mongoose"

const connectDatabase = async () => {
    try {
        mongoose.connect(`${process.env.MONGO_DB_URL}/Forever`);
        console.log("MongoDB Connected Successfully")
    } catch (error) {
        console.log("Error in connecting the DataBase");
        console.error(error.message);
    }
}

export default connectDatabase