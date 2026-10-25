import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser } from '../../controllers/user.controller.js';

const router = Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    body('firstName', 'firstName is required').notEmpty(),
    body('lastName', 'lastName is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('username', 'username is required').notEmpty(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  registerUser
);



export default router;
