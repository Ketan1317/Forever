import jwt from "jsonwebtoken"

const adminAuth = async (req,res,next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized: Token Missing" })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        if (token_decode.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: "Not Authorized" })
        }
        next();

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message })

    }
}

export default adminAuth;