import { validationResult } from 'express-validator';
import { Profile } from "../models/profile.model.js";
import { User } from '../models/user.model.js';
import axios from 'axios';

export const getLoggedInUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['fullName', 'username', 'avatar']);
    
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: 'There is no profile for this user' }] });
    }
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    company,website,location,bio,status,githubUsername,skills,youtube,twitter,facebook,linkedin,instagram
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubUsername) profileFields.githubUsername = githubUsername;
  if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

  //Build social object
  profileFields.social = {}
  if(youtube) profileFields.social.youtube = youtube;
  if(twitter) profileFields.social.twitter = twitter;
  if(facebook) profileFields.social.facebook = facebook;
  if(linkedin) profileFields.social.linkedin = linkedin;
  if(instagram) profileFields.social.instagram = instagram;

  try{
    //see if profile exists
    let profile = await Profile.findOne({ user: req.user.id })
    
    if(profile){
      //update profile
      profile = await Profile.findOneAndUpdate(
        {user: req.user.id},
        { $set : profileFields},
        { new: true }
      )
      return res.json(profile)
    }
    //create new profile
    profile = new Profile(profileFields)
    await profile.save()
    return res.json(profile)    

  }
  catch(err){
    console.error(err.message)
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['fullName', 'username', 'avatar']).sort({date:-1});
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const getProfileByUserId = async (req, res) =>{

  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['fullName', 'username', 'avatar']);
    
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: 'Profile not found' }] });
    }
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    if(err.kind == 'ObjectId'){
      return res.status(404).json({ errors: [{ msg: 'Profile not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const deleteProfileAndUser = async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndDelete({ user: req.user.id })
    //remove user
    await User.findByIdAndDelete(req.user.id)
    return res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const profileExperience = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, company, location, from, to, current, description } = req.body;

  const newExp = { title, company, location, from, to, current, description }

  try{
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp)
    await profile.save()
    return res.json(profile)
  }catch(err){
    console.error(err.message)
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const deleteExperience = async (req, res) => {
  try{
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { experience: { _id: req.params.exp_id } } },
      { new: true }
    );

    if(!profile){
      return res.status(404).json({ errors: [{ msg: 'Profile not found' }] });
    }

    return res.json(profile);
  }
  catch(err){
    console.error(err.message)
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const profileEducation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { school, degree, fieldOfStudy, from, to, current, description } = req.body;

  const newEdu = { school, degree, fieldOfStudy, from, to, current, description }

  try{
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu)
    await profile.save()
    return res.json(profile)
  }catch(err){
    console.error(err.message)
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const deleteEducation = async (req, res) => {
  try{
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { education: { _id: req.params.edu_id } } },
      { new: true }
    );

    if(!profile){
      return res.status(404).json({ errors: [{ msg: 'Profile not found' }] });
    }

    return res.json(profile);
  }
  catch(err){
    console.error(err.message)
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}

export const getGithubRepos = async (req, res) => {
  try {
    const { username } = req.params;
    const { githubClientID, githubSecret } = process.env;

    const headers = {
      'User-Agent': 'node.js',
    };

    // GitHub deprecated client_id/client_secret in query params.
    // Modern authentication uses HTTP Basic Auth header.
    if (githubClientID && githubSecret) {
      headers.Authorization = `Basic ${Buffer.from(
        `${githubClientID}:${githubSecret}`
      ).toString('base64')}`;
    }

    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        params: {
          per_page: 5,
          sort: 'created',
          direction: 'asc',
        },
        headers,
      }
    );

    return res.json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ msg: 'No Github profile found' });
    }
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};