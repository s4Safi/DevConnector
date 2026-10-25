import { validationResult } from 'express-validator';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

// @desc    Register user
// @route   POST api/users
// @access  Public
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()});
  }

  const { firstName , lastName , username , email, password } = req.body;

  try {
    // 1. Check if user already exists
    if (
        [firstName, lastName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        return res.status(400).json({errors: [{msg: 'All fields are required'}]})
    }
    if (!email.includes("@")) {
      return res.status(400).json({errors: [{msg: 'Invalid email format'}]})
    }
    // check if user already exists : username and email 

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        return res.status(409).json({errors:[{msg: "User with email or username already exists"}]})
    }

    // 2. Fetch Gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm',
      protocol: 'https',
    });

    // 3. Create user instance (password will be hashed automatically by pre('save') hook!)
    const newUser = new User({
      fullName : {firstName , lastName},
      username, 
      email,
      password,
      avatar,
    });

    await newUser.save();

    // 4. Return JWT token
    const payload = {
      user: {
        id: newUser.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
