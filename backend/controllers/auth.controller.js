import {User} from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendResetPasswordEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';
import crypto from 'crypto';

export const signUp = async (req, res) => {
    
    const {email, password, name} = req.body;
    try{
        if(!email || !password || !name) {
            throw new Error ("All fields are required")
        };

        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const verificationToken  = Math.floor(10000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt : Date.now() + 24 * 60 * 60 * 1000
        });

        await user.save();

        // after successful registration we send email verification.
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken)

        user.password = undefined;
        res.status(200).json({success: true, message: "User registered Successfully", 
            user: {
                ...user._doc,
                password: undefined
            }});

    }catch(e){

        res.status(400).json({success: false, message: e.message})

    }
};


export const verifyEmail = async (req, res) => {
    const {code} = req.body ; // means we  will get the verification number like 1 2 3 4 5 6

    try{

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()} // means greater than the current date meand it is valid it's not expired
        });

        if(!user){
            throw new Error("Invalid or expired Verification Code")
        }

        //  after verification delete the token 

        user.isverified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        // then we send welcome email
        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            } 
        });
        
    }catch(e){
        console.log(e.message)
        res.status(400).json({success: false, message: e.message})
    }
};

export const login = async (req, res) => {

    const {email, password} = req.body;

    try{

        const user = await User.findOne({email});
        if(!user){
            res.status(404).json({success: false, message: "Invalid Credentials"});
        };

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            res.status(404).json({success: false, message: "Invalid Credentials"});
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });


    }catch(e){
        console.log("error at logging...")
        res.status(400).json({success: false, message: e.message})
    }

};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "User logged out successfully"})
};

export const forgotPassword = async (req, res) => {
    const {email} = req.body;

    try{

        const user = await User.findOne({email});
        if(!user){
           return res.status(404).json({success: false, message:"User not found"});
        }

        // Generate reset token for reset password
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // send email
        await sendResetPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({success: true, message: "Reset password link sent to your email successfully"})

    }catch(e){
        console.log(e)
        res.status(400).json({success: false, message: e.message})
    }
}

export const resetPassword = async (req, res) => {
    
    try{
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        }); // this token has not expired

        if(!user){
            res.status(400).json({success: false, message: "Invalid or expired token"})
        };

        // update password
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);
        
        res.status(200).json({success: true, message:"Password reset successfully"});

    }catch(e){
        console.log("error resetting password", e)
        res.status(400).json({success: false, message: e.message})
    }

}


export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password"); //unselect password
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};