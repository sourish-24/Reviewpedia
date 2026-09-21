import Snippet from '../models/Snippet.js';
import User from '../models/User.js';

const MAX_MEDIA_LIMIT = 128 * 1024 * 1024; // 128 MB

export const getSnippets = async (req, res, next) => {
    try {
        const { category, search, limit = 50, skip = 0 } = req.query;
        let filter = {};

        if (category && category !== 'All') {
            filter['product.category'] = category;
        }

        if (search && search.trim()) {
            filter.$text = { $search: search.trim() };
        }

        const snippets = await Snippet.find(filter)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        // Gather unique user IDs to fetch latest profile pics
        const userIds = [...new Set(snippets.map(s => s.user?.id).filter(Boolean))];
        const users = await User.find({ _id: { $in: userIds } }).select('_id username profilePic');
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = u;
        });

        const currentUserId = req.user?.id?.toString() || req.user?._id?.toString();

        const formatted = snippets.map(s => {
            const obj = s.toObject();
            const u = obj.user?.id ? userMap[obj.user.id.toString()] : null;
            if (u) {
                obj.user.profilePic = u.profilePic || obj.user.profilePic || '';
                obj.user.name = u.username || obj.user.name;
            }
            obj.id = obj._id.toString();
            obj.likes = obj.likes || [];
            obj.likesCount = obj.likes.length;
            obj.isLiked = currentUserId ? obj.likes.includes(currentUserId) : false;
            obj.commentsCount = (obj.comments || []).length;
            return obj;
        });

        res.json(formatted);
    } catch (err) {
        next(err);
    }
};

export const getSnippetById = async (req, res, next) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const userDoc = snippet.user?.id ? await User.findById(snippet.user.id).select('username profilePic') : null;
        const obj = snippet.toObject();
        obj.id = obj._id.toString();
        if (userDoc) {
            obj.user.profilePic = userDoc.profilePic || obj.user.profilePic || '';
            obj.user.name = userDoc.username || obj.user.name;
        }
        const currentUserId = req.user?.id?.toString() || req.user?._id?.toString();
        obj.likes = obj.likes || [];
        obj.likesCount = obj.likes.length;
        obj.isLiked = currentUserId ? obj.likes.includes(currentUserId) : false;
        obj.commentsCount = (obj.comments || []).length;

        res.json(obj);
    } catch (err) {
        next(err);
    }
};

export const createSnippet = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'A video file is required to create a snippet' });
        }

        const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;
        const productName = bodyData.product?.name || bodyData.productName;
        const rating = Number(bodyData.product?.rating || bodyData.rating);
        const duration = Number(bodyData.duration || 0);

        if (!productName || !productName.trim()) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'A valid rating between 1 and 5 is required' });
        }

        // Strict 60-second limit check (allowing slight 2s margin for encoding variations)
        if (duration > 62) {
            return res.status(400).json({ error: 'Snippet videos must be 60 seconds or under' });
        }

        const userDoc = await User.findById(req.user.id);
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        const fileSize = req.file.size || req.file.bytes || 0;
        if (fileSize > 0) {
            if ((userDoc.totalMediaBytes || 0) + fileSize > MAX_MEDIA_LIMIT) {
                return res.status(400).json({ 
                    error: 'Storage limit reached! You have reached your 128 MB media upload limit.' 
                });
            }
            await User.findByIdAndUpdate(userDoc._id, { $inc: { totalMediaBytes: fileSize } });
        }

        const newSnippet = new Snippet({
            videoUrl: req.file.path,
            duration: Math.round(duration),
            product: {
                name: productName.trim(),
                brand: (bodyData.product?.brand || bodyData.brand || '').trim(),
                category: bodyData.product?.category || bodyData.category || 'General',
                rating: rating,
                purchaseLink: (bodyData.product?.purchaseLink || bodyData.purchaseLink || '').trim()
            },
            caption: (bodyData.caption || '').trim(),
            user: {
                id: userDoc._id,
                name: userDoc.username,
                profilePic: userDoc.profilePic || ''
            },
            likes: [],
            views: 0,
            comments: []
        });

        await newSnippet.save();

        const obj = newSnippet.toObject();
        obj.id = obj._id.toString();
        obj.likesCount = 0;
        obj.isLiked = false;
        obj.commentsCount = 0;

        res.status(201).json(obj);
    } catch (err) {
        next(err);
    }
};

export const toggleLikeSnippet = async (req, res, next) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const userId = req.user.id.toString();
        snippet.likes = snippet.likes || [];
        const index = snippet.likes.indexOf(userId);

        if (index > -1) {
            snippet.likes.splice(index, 1);
        } else {
            snippet.likes.push(userId);
        }

        await snippet.save();

        res.json({
            success: true,
            likes: snippet.likes,
            likesCount: snippet.likes.length,
            isLiked: snippet.likes.includes(userId)
        });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const comments = (snippet.comments || []).map(c => {
            const obj = c.toObject ? c.toObject() : c;
            return {
                ...obj,
                id: (obj._id || obj.id).toString(),
                parentId: obj.parentId ? obj.parentId.toString() : null,
                likes: obj.likes || [],
                user: obj.user || {}
            };
        });

        res.json(comments);
    } catch (err) {
        next(err);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const { text, parentId } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text cannot be empty' });
        }

        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const userDoc = await User.findById(req.user.id);
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newComment = {
            user: {
                id: userDoc._id,
                name: userDoc.username,
                profilePic: userDoc.profilePic || ''
            },
            text: text.trim(),
            parentId: parentId || null,
            likes: [],
            createdAt: new Date()
        };

        snippet.comments.push(newComment);
        await snippet.save();

        const added = snippet.comments[snippet.comments.length - 1];
        const obj = added.toObject ? added.toObject() : added;
        obj.id = (obj._id || obj.id).toString();
        obj.parentId = obj.parentId ? obj.parentId.toString() : null;

        res.status(201).json(obj);
    } catch (err) {
        next(err);
    }
};

export const toggleLikeComment = async (req, res, next) => {
    try {
        const { id, commentId } = req.params;
        const snippet = await Snippet.findById(id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const comment = snippet.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const currentUserId = req.user.id.toString();
        if (!comment.likes) comment.likes = [];
        const idx = comment.likes.indexOf(currentUserId);
        if (idx === -1) {
            comment.likes.push(currentUserId);
        } else {
            comment.likes.splice(idx, 1);
        }

        await snippet.save();
        res.json({ success: true, likes: comment.likes });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const { id, commentId } = req.params;
        const snippet = await Snippet.findById(id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const comment = snippet.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const currentUserId = req.user.id.toString();
        const isCommentAuthor = comment.user?.id?.toString() === currentUserId;
        const isSnippetAuthor = snippet.user?.id?.toString() === currentUserId;
        const isAdmin = req.user.role === 'admin';

        if (!isCommentAuthor && !isSnippetAuthor && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Delete comment and any descendant replies
        const toDelete = new Set([commentId.toString()]);
        let changed = true;
        while (changed) {
            changed = false;
            snippet.comments.forEach(c => {
                const cId = c._id.toString();
                if (c.parentId && toDelete.has(c.parentId.toString()) && !toDelete.has(cId)) {
                    toDelete.add(cId);
                    changed = true;
                }
            });
        }

        snippet.comments = snippet.comments.filter(c => !toDelete.has(c._id.toString()));
        await snippet.save();

        res.json({
            success: true,
            comments: snippet.comments,
            commentsCount: snippet.comments.length
        });
    } catch (err) {
        next(err);
    }
};

export const deleteSnippet = async (req, res, next) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        const currentUserId = req.user.id.toString();
        const isAuthor = snippet.user?.id?.toString() === currentUserId;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this snippet' });
        }

        await Snippet.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Snippet deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const incrementView = async (req, res, next) => {
    try {
        await Snippet.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};
