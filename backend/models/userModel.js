import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    cartData:{type:Object,default : {}} // object type

},{minimize:false})  // By default, Mongoose removes empty objects (e.g., {}) from the database when saving.....
// minimize: false ensures that even empty objects (like an empty cartData) will be stored in the database as it is.

const userModel = mongoose.model("user",userSchema);

export default userModel;

