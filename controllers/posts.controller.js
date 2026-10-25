import { validationResult } from 'express-validator';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';

export const createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id).select('-password');
    const { text } = req.body;
    const post = new Post({
      text,
      user: req.user.id,
      name: `${user.fullName.firstName} ${user.fullName.lastName}`,
      avatar: user.avatar,
    });
    await post.save();
    return res.json(post);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }

    if(post.user.toString() !== req.user.id){
     return res.status(401).json({ errors: [{ msg: 'You can only delete your own posts' }] });
    }

    await post.deleteOne();
    return res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    //check if post is already liked by the user
    if(post.likes.some(like => like.user.toString() === req.user.id)){ 
      return res.status(400).json({ errors: [{ msg: 'Post already liked' }] });
    }
    
    post.likes.unshift({ user: req.user.id});
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};
export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }

    // Check if post has NOT been liked yet
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) { 
      return res.status(400).json({ errors: [{ msg: 'Post has not yet been liked' }] });
    }
    
    // Modern removal: filter out the logged-in user's like
    post.likes = post.likes.filter((like) => like.user.toString() !== req.user.id);

    await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const addComment = async (req, res) => {
  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user= await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    const {text} = req.body;
    const newComment = {
      text,
      user: req.user.id,
      name: `${user.fullName.firstName} ${user.fullName.lastName}`,
      avatar: user.avatar
    };
    post.comments.unshift(newComment);
    await post.save();
    return res.json(post.comments);
  }
  catch(error){
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
};

export const removeComment = async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    const comment = post.comments.find(comment => comment.id === req.params.commentId);
    if(!comment){
      return res.status(404).json({ errors: [{ msg: 'Comment not found' }] });
    }
    if(comment.user.toString() !== req.user.id){
      return res.status(401).json({ errors: [{ msg: 'You can only delete your own comments' }] });
    }
    post.comments = post.comments.filter(comment => comment.id !== req.params.commentId);
    await post.save();
    return res.json(post.comments);
  }
  catch(error){
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: [{ msg: 'Post not found' }] });
    }
    return res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
}