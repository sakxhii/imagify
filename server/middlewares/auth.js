// import jwt from "jsonwebtoken";

// const userAuth = async (req, res, next) => {
//     const {token} = req.headers.authorization;

//     if(!token) {
//         return res.json({success: false, message: 'Not Authorized. Login Again'})
//     }
    
//     // if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     //     return res.status(401).json({ message: "Unauthorized: No token or invalid token format" });
//     // }

//     // // Extract token from 'Bearer <token>'
//     // const token = authHeader.split(" ")[1];

//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        
//         if(tokenDecode.id){
//             req.body.userId = tokenDecode.id;
//         } else {
//             return res.json({success: false, message: 'Not Authorized. Login Again'})
//         }

//         next();

//     } catch (error) {
//         console.error("Auth Error:", error);
//         return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });
//     }
// };

// export default userAuth;



import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    try {
        // Extract authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify the token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (!tokenDecode.id) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        }

        // Attach user ID to request body
        req.body.userId = tokenDecode.id;

        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
};

export default userAuth;

