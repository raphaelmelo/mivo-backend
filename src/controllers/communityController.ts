import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';

// Get all posts (Feed)
export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20, offset = 0, sort = 'new' } = req.query;

    const order: any = [
      ['isPinned', 'DESC'],
      ...(sort === 'hot' ? [['votes', 'DESC'], ['createdAt', 'DESC']] : [['createdAt', 'DESC']])
    ];

    const posts = await Post.findAll({
      limit: Number(limit),
      offset: Number(offset),
      order,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'level', 'avatar'], // Assuming avatar exists or we construct it
        },
      ],
    });
    
    // Enrich with comment counts if needed, but for now raw posts
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

// Get single post with comments
export const getPostDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'level'],
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'level'],
            }
          ],
          order: [['createdAt', 'ASC']] // Oldest first for comments usually? or Newest? Reddit is votes. MVP: Chronological.
        }
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count (fire and forget)
    post.increment('views');

    res.json(post);
  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).json({ message: 'Error fetching post details' });
  }
};

// Create a new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, content, tags } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await Post.create({
      userId,
      title,
      content,
      tags: tags || [],
      votes: 0,
      views: 0
    });

    // Return the complete post with author info
    const postWithAuthor = await Post.findByPk(post.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'level'] }]
    });

    res.status(201).json(postWithAuthor);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

// Create a comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    const { content, parentId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await Comment.create({
      userId,
      postId: Number(postId),
      parentId: parentId ? Number(parentId) : null,
      content,
      votes: 0
    });
    
    const commentWithAuthor = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'level'] }]
    });

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Vote on post (MVP: Simple increment/decrement without tracking user votes per post in DB)
export const votePost = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { direction } = req.body; // 1 for up, -1 for down

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const increment = direction === 1 ? 1 : -1;
        await post.increment('votes', { by: increment });
        
        // Reload to get new value
        await post.reload();

        res.json({ votes: post.votes });
    } catch (error) {
        console.error('Error voting post:', error);
        res.status(500).json({ message: 'Error voting' });
    }
};
