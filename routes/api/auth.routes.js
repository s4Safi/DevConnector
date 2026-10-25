import { Router } from 'express';
import { body } from 'express-validator';
import verifyJWT from '../../middleware/auth.middleware.js';
import { getAuthUser, loginUser } from '../../controllers/auth.controller.js';

const router = Router();

// @route   GET api/auth/get-auth-user
// @desc    Get authenticated user
// @access  Private
router.get('/get-auth-user', verifyJWT, getAuthUser);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  loginUser
);




export default router;
