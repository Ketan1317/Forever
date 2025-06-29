import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image"
        });
        fs.unlinkSync(localFilePath); // Remove the local file after uploading
        console.log(response.url)
        return response.url;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Clean up the file even if upload fails
        throw error;
    }
};

export default uploadOnCloudinary;
