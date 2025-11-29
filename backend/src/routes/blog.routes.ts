import { Router } from 'express';
import { BlogService } from '../services/blog.service.js';

const router = Router();

// POST /blog/generate
router.post('/generate', async (req, res) => {
    try {
        const { claim } = req.body;
        if (!claim) {
            return res.status(400).json({ error: 'Claim is required' });
        }
        const result = await BlogService.generateBlog(claim);
        res.json(result);
    } catch (error: any) {
        console.error('Blog generation failed:', error);
        res.status(500).json({ error: 'Failed to generate blog' });
    }
});

// GET /blog/list
router.get('/list', async (req, res) => {
    try {
        const result = await BlogService.getList();
        res.json(result);
    } catch (error: any) {
        console.error('Failed to fetch blog list:', error);
        res.status(500).json({ error: 'Failed to fetch blog list' });
    }
});

// GET /blog/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BlogService.getById(id);

        if (!result) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        res.json(result);
    } catch (error: any) {
        console.error('Failed to fetch blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

export default router;
