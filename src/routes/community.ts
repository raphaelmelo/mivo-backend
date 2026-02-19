import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { 
    getPosts, 
    getPostDetails, 
    createPost, 
    createComment, 
    votePost 
} from '../controllers/communityController';

const router = Router();

// Public/Protected Routes (Assuming all community actions require auth for now)
router.get('/posts', authMiddleware, getPosts);
router.get('/posts/:id', authMiddleware, getPostDetails);
router.post('/posts', authMiddleware, createPost);
router.post('/posts/:postId/comments', authMiddleware, createComment);
router.post('/posts/:id/vote', authMiddleware, votePost);

// MVP: No comment voting route yet, or can add later.

export default router;
