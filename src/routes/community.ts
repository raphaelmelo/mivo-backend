import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { 
    getPosts, 
    getPostDetails, 
    createPost,
    updatePost,
    deletePost,
    createComment,
    deleteComment,
    votePost 
} from '../controllers/communityController';

const router = Router();

// Posts
router.get('/posts', authMiddleware, getPosts);
router.get('/posts/:id', authMiddleware, getPostDetails);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost);
router.delete('/posts/:id', authMiddleware, deletePost);
router.post('/posts/:id/vote', authMiddleware, votePost);

// Comments
router.post('/posts/:postId/comments', authMiddleware, createComment);
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteComment);

export default router;
