import { Router } from 'express';
import {
  getLoggedInUserProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  deleteProfileAndUser,
  profileExperience,
  deleteExperience,
  profileEducation,
  deleteEducation,
  getGithubRepos
} from '../../controllers/profile.controller.js';
import verifyJWT from '../../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = Router();

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', verifyJWT, getLoggedInUserProfile);

// @route   POST api/profile
// @desc    Create or update logged-in user's profile
// @access  Private
router.post('/',[verifyJWT,[
    body('status', 'Status is required').notEmpty(),
    body('skills', 'Skills is required').notEmpty()
  ]],createOrUpdateProfile
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/',verifyJWT,getAllProfiles);

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id',getProfileByUserId);

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/', verifyJWT, deleteProfileAndUser);

// @route   PUT api/profile/experience
// @desc    Add or update user's experience
// @access  Private
router.put('/experience',verifyJWT,
  body('title', 'Title is required').notEmpty(),
  body('company', 'Company is required').notEmpty(),
  body('from', 'From date is required').notEmpty(),
  profileExperience
)

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete user's experience
// @access  Private
router.delete('/experience/:exp_id',verifyJWT,deleteExperience)

//@route   PUT api/profile/education
//@desc    Add or update user's education
//@access  Private
 router.put('/education',verifyJWT,
  body('school','school is required').notEmpty(),
  body('degree','degree is required').notEmpty(),
  body('fieldOfStudy','fieldOfStudy is required').notEmpty(),
  body('from','from date is required').notEmpty(),
  profileEducation
)

//@route   DELETE api/profile/education/:edu_id
//@desc    Delete user's education
//@access  Private
router.delete('/education/:edu_id',verifyJWT,deleteEducation)

//@route   GET api/profile/github/:username
//@desc    Get user's github repos
//@access  Public
router.get('/github/:username',getGithubRepos)



export default router;