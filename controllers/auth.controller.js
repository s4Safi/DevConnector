import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';


// @desc    Get authenticated user data
// @route   GET api/auth
// @access  Private
export const getAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};



// @desc    Login user
// @route   POST api/auth
// @access  Public
export const loginUser = async(req, res) =>{
const {email,password} = req.body;

const errors = validationResult(req)
if (!errors.isEmpty()){
  return res.status(400).json({errors: errors.array()})
}

try{
  const user = await User.findOne({email: email.toLowerCase().trim()});
  if (!user){
    return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
  }

  const comparePassword = await user.isPasswordCorrect(password)
  if (!comparePassword){
    return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
  }

  const payload = {
    user: {
      id: user.id,
    },
  }; 

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

  return res.status(200).json({ token });  

}catch(err){
  console.error(err.message);
  return res.status(500).json({errors: [{msg: 'Server error'}]});
}


} 