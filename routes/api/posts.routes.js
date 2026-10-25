import { Router } from 'express';
import { createPost, getPosts, deletePost, likePost, getPostById, unlikePost, addComment, removeComment } from '../../controllers/posts.controller.js';
import { body } from 'express-validator';
import verifyJWT from '../../middleware/auth.middleware.js';
const router = Router();

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/',[verifyJWT,body('text','text is required').notEmpty()],createPost);


// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', getPosts);

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get("/:id",verifyJWT,getPostById)

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id",verifyJWT,deletePost)

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put("/like/:id",verifyJWT,likePost);

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put("/unlike/:id",verifyJWT,unlikePost);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post("/comment/:id",[verifyJWT,body('text','text is required').notEmpty()],addComment);


router.delete("/comment/:id/:commentId",verifyJWT,removeComment)

export default router;
