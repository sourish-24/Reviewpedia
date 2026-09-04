import Review from '../models/Review.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { latLngToCell } from 'h3-js';
import { cloudinaryInstance } from '../middlewares/uploadMiddleware.js';

const MAX_MEDIA_LIMIT = 128 * 1024 * 1024; // 128 MB

export const getReviews = async (req, res, next) => {
    try {
        const search = req.query.search;
        let filter = {};
        if (search && search.trim() !== '') {
          filter = { $text: { $search: search } };
        }
        const reviews = await Review.find(filter).sort({ _id: -1 }).limit(500);

        const reviewIds = reviews.map(r => r._id);
        const userIds = reviews.map(r => r.user?.id).filter(Boolean);
        const userNames = reviews.map(r => r.user?.name).filter(Boolean);

        const [users, commentCounts] = await Promise.all([
            User.find({
                $or: [
                    { _id: { $in: userIds } },
                    { username: { $in: userNames } }
                ]
            }, 'username profilePic').lean(),
            Comment.aggregate([
                { $match: { reviewId: { $in: reviewIds } } },
                { $group: { _id: '$reviewId', count: { $sum: 1 } } }
            ])
        ]);

        const userMap = {};
        users.forEach(u => {
            if (u._id) userMap[u._id.toString()] = u.profilePic || '';
            if (u.username) userMap[u.username] = u.profilePic || '';
        });

        const countMap = {};
        commentCounts.forEach(c => {
            if (c._id) countMap[c._id.toString()] = c.count;
        });

        const normalized = reviews.map(r => {
            const obj = r.toObject();
            obj.id = obj._id.toString();
            obj.likes = obj.likes || [];
            obj.commentsCount = countMap[obj.id] || 0;
            const pic = (obj.user?.id && userMap[obj.user.id.toString()]) || (obj.user?.name && userMap[obj.user.name]) || '';
            obj.user = {
                ...obj.user,
                profilePic: pic
            };
            return obj;
        });
        res.json(normalized);
    } catch (err) {
        next(err);
    }
};

export const createReview = async (req, res, next) => {
    try {
        // Since we are using FormData, JSON is sent as a string inside req.body.data
        const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;
        const files = req.files || (req.file ? [req.file] : []);

        let totalNewSize = 0;
        for (const file of files) {
            totalNewSize += (file.size || file.bytes || 0);
        }

        const username = req.user?.username || bodyData.user?.name;
        const userDoc = req.user?.id ? await User.findById(req.user.id) : (username ? await User.findOne({ username }) : null);

        if (userDoc && totalNewSize > 0) {
            if ((userDoc.totalMediaBytes || 0) + totalNewSize > MAX_MEDIA_LIMIT) {
                return res.status(400).json({ error: "Storage limit reached! You have reached the 128 MB media upload limit. Please delete some reviews or chat media to free up space." });
            }
            await User.findByIdAndUpdate(userDoc._id, { $inc: { totalMediaBytes: totalNewSize } });
        }

        let mediaArray = [];
        for (const file of files) {
            const fileSize = file.size || file.bytes || 0;
            const isVideo = file.mimetype?.startsWith('video/') || file.path?.match(/\.(mp4|mov|avi|webm)$/i);
            mediaArray.push({ type: isVideo ? 'video' : 'image', url: file.path, size: fileSize });
        }

        const newReview = new Review({
           ...bodyData,
           review: { ...bodyData.review, media: mediaArray },
           user: {
               id: userDoc?._id || req.user?.id,
               name: req.user?.username || bodyData.user?.name || 'LocalUser' + Math.floor(Math.random() * 999)
           },
           source: {
               platform: bodyData.source?.platform || 'Reviewpedia',
               isScraped: false
           },
           analytics: { trustScore: bodyData.analytics?.trustScore || Math.floor(Math.random() * 40) + 60, sentimentScore: bodyData.review?.rating / 5 || 0.5 },
           metadata: { date: new Date().toISOString().split('T')[0] },
           location: {
               city: bodyData.location?.city || 'Local',
               lat: bodyData.location?.lat || 28.7041,
               lng: bodyData.location?.lng || 77.1025,
               h3Index: bodyData.location?.lat ? latLngToCell(bodyData.location.lat, bodyData.location.lng, 9) : "893da164ebfffff"
           }
        });
        await newReview.save();
        
        const rObj = newReview.toObject();
        rObj.id = rObj._id.toString();
        rObj.user = {
            ...rObj.user,
            profilePic: userDoc?.profilePic || ''
        };
        
        res.status(201).json(rObj);
    } catch (err) {
        next(err);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Authorize delete
        const isDeleteOwner = (review.user?.id && req.user?.id && review.user.id.toString() === req.user.id.toString()) ||
                              (review.user?.name === req.user?.username) ||
                              (req.user?.role === 'admin');
        if (!isDeleteOwner) {
            return res.status(403).json({ error: 'You are not authorized to delete this review' });
        }

        let bytesToSubtract = 0;
        // Delete images from Cloudinary if they exist
        if (review.review?.media && review.review.media.length > 0) {
            for (let m of review.review.media) {
                bytesToSubtract += (m.size || 0);
                if (m.url && m.url.includes('cloudinary.com')) {
                    const parts = m.url.split('/');
                    const filename = parts.pop().split('.')[0]; // strip extension
                    const folder = parts.pop(); // 'reviewpedia'
                    const publicId = `${folder}/${filename}`;
                    await cloudinaryInstance.uploader.destroy(publicId, {
                        resource_type: m.type === 'video' ? 'video' : 'image'
                    }).catch(e => console.error("Cloudinary delete failed", e));
                }
            }
        }

        if (bytesToSubtract > 0) {
            const userDoc = await User.findOne({ $or: [{ _id: req.user?.id }, { username: review.user?.name }] });
            if (userDoc) {
                const newTotal = Math.max(0, (userDoc.totalMediaBytes || 0) - bytesToSubtract);
                await User.findByIdAndUpdate(userDoc._id, { totalMediaBytes: newTotal });
            }
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        next(err);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Authorize edit
        const isEditOwner = (review.user?.id && req.user?.id && review.user.id.toString() === req.user.id.toString()) ||
                            (review.user?.name === req.user?.username) ||
                            (req.user?.role === 'admin');
        if (!isEditOwner) {
            return res.status(403).json({ error: 'You are not authorized to edit this review' });
        }

        const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;
        const existingMedia = bodyData.existingMedia || [];

        const files = req.files || (req.file ? [req.file] : []);
        let totalNewSize = 0;
        for (const file of files) {
            totalNewSize += (file.size || file.bytes || 0);
        }

        // Find removed old media to cleanup Cloudinary and user storage
        const oldMedia = review.review?.media || [];
        const keptUrls = new Set(existingMedia.map(m => m.url));
        let removedOldSize = 0;
        for (const oldM of oldMedia) {
            if (!keptUrls.has(oldM.url)) {
                removedOldSize += (oldM.size || 0);
                if (oldM.url && oldM.url.includes('cloudinary.com')) {
                    try {
                        const parts = oldM.url.split('/');
                        const filename = parts.pop().split('.')[0];
                        const folder = parts.pop();
                        const publicId = `${folder}/${filename}`;
                        await cloudinaryInstance.uploader.destroy(publicId, {
                            resource_type: oldM.type === 'video' ? 'video' : 'image'
                        }).catch(e => console.error("Cloudinary destroy error:", e));
                    } catch (e) {
                        console.error("Cloudinary destroy failed", e);
                    }
                }
            }
        }

        const diff = totalNewSize - removedOldSize;
        const username = req.user?.username || review.user?.name;
        const userDoc = req.user?.id ? await User.findById(req.user.id) : (username ? await User.findOne({ username }) : null);

        if (userDoc && diff > 0) {
            if ((userDoc.totalMediaBytes || 0) + diff > MAX_MEDIA_LIMIT) {
                return res.status(400).json({ error: "Storage limit reached! You have reached the 128 MB media upload limit. Please delete some reviews or chat media to free up space." });
            }
        }

        if (userDoc && diff !== 0) {
            const newTotal = Math.max(0, (userDoc.totalMediaBytes || 0) + diff);
            await User.findByIdAndUpdate(userDoc._id, { totalMediaBytes: newTotal });
        }

        let updatedMediaArray = [];
        if (bodyData.mediaOrder && Array.isArray(bodyData.mediaOrder)) {
            const newUploadedMedia = [];
            for (const file of files) {
                const fileSize = file.size || file.bytes || 0;
                const isVideo = file.mimetype?.startsWith('video/') || file.path?.match(/\.(mp4|mov|avi|webm)$/i);
                newUploadedMedia.push({ type: isVideo ? 'video' : 'image', url: file.path, size: fileSize });
            }
            let newFileIdx = 0;
            for (const item of bodyData.mediaOrder) {
                if (item.type === 'existing') {
                    const found = existingMedia.find(m => m.url === item.url);
                    if (found) updatedMediaArray.push(found);
                } else if (item.type === 'new') {
                    if (newFileIdx < newUploadedMedia.length) {
                        updatedMediaArray.push(newUploadedMedia[newFileIdx++]);
                    }
                }
            }
        } else {
            updatedMediaArray = [...existingMedia];
            for (const file of files) {
                const fileSize = file.size || file.bytes || 0;
                const isVideo = file.mimetype?.startsWith('video/') || file.path?.match(/\.(mp4|mov|avi|webm)$/i);
                updatedMediaArray.push({ type: isVideo ? 'video' : 'image', url: file.path, size: fileSize });
            }
        }

        if (bodyData.product?.name) review.product.name = bodyData.product.name;
        if (bodyData.product?.brand !== undefined) review.product.brand = bodyData.product.brand;
        if (bodyData.product?.category) review.product.category = bodyData.product.category;

        if (bodyData.review) {
            if (bodyData.review.text !== undefined) {
                review.review.text = bodyData.review.text;
                review.review.title = bodyData.review.text.substring(0, 50);
            }
            if (bodyData.review.rating !== undefined) {
                review.review.rating = bodyData.review.rating;
                if (review.analytics) review.analytics.sentimentScore = bodyData.review.rating / 5;
            }
            review.review.media = updatedMediaArray;
        }

        await review.save();

        const rObj = review.toObject();
        rObj.id = rObj._id.toString();

        res.json(rObj);
    } catch (err) {
        next(err);
    }
};

export const toggleLikeReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const userId = req.user?.id?.toString() || req.user?._id?.toString() || req.user?.username || req.body?.userId || req.body?.username;
        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        const currentLikes = Array.isArray(review.likes) ? review.likes : [];
        const hasLiked = currentLikes.includes(userId);

        let updatedReview;
        if (hasLiked) {
            updatedReview = await Review.findByIdAndUpdate(
                req.params.id,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            updatedReview = await Review.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        const updatedLikes = updatedReview ? (updatedReview.likes || []) : [];

        res.json({
            success: true,
            likes: updatedLikes,
            likesCount: updatedLikes.length,
            isLiked: !hasLiked
        });
    } catch (err) {
        next(err);
    }
};

export const getReviewById = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        let profilePic = '';
        if (review.user?.id) {
            const u = await User.findById(review.user.id, 'profilePic').lean();
            if (u?.profilePic) profilePic = u.profilePic;
        } else if (review.user?.name) {
            const u = await User.findOne({ username: review.user.name }, 'profilePic').lean();
            if (u?.profilePic) profilePic = u.profilePic;
        }

        const commentsCount = await Comment.countDocuments({ reviewId: review._id });

        const obj = review.toObject();
        obj.id = obj._id.toString();
        obj.likes = obj.likes || [];
        obj.commentsCount = commentsCount;
        obj.user = {
            ...obj.user,
            profilePic: profilePic || obj.user?.profilePic || ''
        };

        res.json(obj);
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comments = await Comment.find({ reviewId: id }).sort({ createdAt: 1 }).lean();

        const userIds = comments.map(c => c.user?.id).filter(Boolean);
        const userNames = comments.map(c => c.user?.name).filter(Boolean);

        const users = await User.find({
            $or: [
                { _id: { $in: userIds } },
                { username: { $in: userNames } }
            ]
        }, 'username profilePic').lean();

        const userMap = {};
        users.forEach(u => {
            if (u._id) userMap[u._id.toString()] = u.profilePic || '';
            if (u.username) userMap[u.username] = u.profilePic || '';
        });

        const normalized = comments.map(c => ({
            ...c,
            id: c._id.toString(),
            reviewId: c.reviewId.toString(),
            parentId: c.parentId ? c.parentId.toString() : null,
            likes: c.likes || [],
            user: {
                ...c.user,
                profilePic: (c.user?.id && userMap[c.user.id.toString()]) || (c.user?.name && userMap[c.user.name]) || c.user?.profilePic || ''
            }
        }));

        res.json(normalized);
    } catch (err) {
        next(err);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text, parentId } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        let validParentId = null;
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
            validParentId = parentComment._id;
        }

        const newComment = new Comment({
            reviewId: review._id,
            parentId: validParentId,
            user: {
                id: req.user.id,
                name: req.user.username,
                profilePic: req.user.profilePic || ''
            },
            text: text.trim(),
            likes: []
        });

        await newComment.save();

        const obj = newComment.toObject();
        obj.id = obj._id.toString();
        obj.reviewId = obj.reviewId.toString();
        obj.parentId = obj.parentId ? obj.parentId.toString() : null;

        res.status(201).json(obj);
    } catch (err) {
        next(err);
    }
};

export const toggleLikeComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user?.id?.toString() || req.user?._id?.toString() || req.user?.username;
        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        const currentLikes = Array.isArray(comment.likes) ? comment.likes : [];
        const hasLiked = currentLikes.includes(userId);

        let updatedComment;
        if (hasLiked) {
            updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                { $pull: { likes: userId } },
                { new: true }
            );
        } else {
            updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
        }

        const updatedLikes = updatedComment ? (updatedComment.likes || []) : [];

        res.json({
            success: true,
            likes: updatedLikes,
            likesCount: updatedLikes.length,
            isLiked: !hasLiked
        });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user?.id?.toString() || req.user?._id?.toString();
        const username = req.user?.username;

        const isAuthor = (comment.user?.id && comment.user.id.toString() === userId) ||
                         (comment.user?.name && comment.user.name === username) ||
                         req.user?.role === 'admin';

        if (!isAuthor) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        const deleteDescendants = async (parentId) => {
            const children = await Comment.find({ parentId });
            for (const child of children) {
                await deleteDescendants(child._id);
            }
            await Comment.deleteMany({ parentId });
        };

        await deleteDescendants(comment._id);
        await Comment.findByIdAndDelete(commentId);

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (err) {
        next(err);
    }
};

