import express from 'express';
import { checkAuth, forgotPassword, login, logout, resetPassword, signUp, verifyEmail } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth)

router.post("/signup", signUp);
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get('/mk', verifyToken, (req, res) => {
    res.send('Hello, World!');
})

export default router;
