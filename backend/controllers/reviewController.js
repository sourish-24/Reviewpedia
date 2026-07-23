import Review from '../models/Review.js';
import { latLngToCell } from 'h3-js';
import { cloudinaryInstance } from '../middlewares/uploadMiddleware.js';

export const getReviews = async (req, res, next) => {
    try {
        const search = req.query.search;
        let filter = {};
        if (search && search.trim() !== '') {
          filter = { $text: { $search: search } };
        }
        // _id contains insertion timestamp natively, works without timestamps: true
        const reviews = await Review.find(filter).sort({ _id: -1 }).limit(500);
        const normalized = reviews.map(r => ({ ...r.toObject(), id: r._id.toString() }));
        res.json(normalized);
    } catch (err) {
        next(err);
    }
};

export const createReview = async (req, res, next) => {
    try {
        // Since we are using FormData, JSON is sent as a string inside req.body.data
        const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

        let mediaArray = [];
        if (req.file) {
            mediaArray.push({ type: 'image', url: req.file.path });
        }

        const newReview = new Review({
           ...bodyData,
           review: { ...bodyData.review, media: mediaArray },
           user: { name: req.user?.username || bodyData.user?.name || 'LocalUser' + Math.floor(Math.random() * 999) },
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
        if (review.user?.name !== req.user?.username && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to delete this review' });
        }

        // Delete images from Cloudinary if they exist
        if (review.review?.media && review.review.media.length > 0) {
            for (let m of review.review.media) {
                if (m.url && m.url.includes('cloudinary.com')) {
                    const parts = m.url.split('/');
                    const filename = parts.pop().split('.')[0]; // strip extension
                    const folder = parts.pop(); // 'reviewpedia'
                    const publicId = `${folder}/${filename}`;
                    await cloudinaryInstance.uploader.destroy(publicId).catch(e => console.error("Cloudinary delete failed", e));
                }
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
        if (review.user?.name !== req.user?.username && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'You are not authorized to edit this review' });
        }

        const bodyData = req.body.data ? JSON.parse(req.body.data) : req.body;

        let mediaArray = review.review?.media || [];
        if (req.file) {
            mediaArray = [{ type: 'image', url: req.file.path }];
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
            if (req.file) {
                review.review.media = mediaArray;
            }
        }

        await review.save();

        const rObj = review.toObject();
        rObj.id = rObj._id.toString();

        res.json(rObj);
    } catch (err) {
        next(err);
    }
};
