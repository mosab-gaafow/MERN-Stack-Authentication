import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({success: false, message: 'UnAuthorized - No token provided'});
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({success: false, message: 'UnAuthorized - No token provided'});
        }
        req.userId = decoded.userId;

        next();

    }catch(err){
        console.error("error verifying token",e);
        res.status(403).json({message: 'Invalid token'});
    }
}