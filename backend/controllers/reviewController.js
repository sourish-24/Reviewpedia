import Review from '../models/Review.js';
import { latLngToCell } from 'h3-js';

export const getReviews = async (req, res, next) => {
    try {
        const search = req.query.search;
        let filter = {};
        if (search && search.trim() !== '') {
          filter = { $text: { $search: search } };
        }
        const reviews = await Review.find(filter).limit(500);
        const normalized = reviews.map(r => ({ ...r.toObject(), id: r._id.toString() }));
        res.json(normalized);
    } catch (err) {
        next(err);
    }
};

export const createReview = async (req, res, next) => {
    try {
        const newReview = new Review({
           ...req.body,
           user: { name: req.body.user?.name || 'LocalUser' + Math.floor(Math.random() * 999) },
           analytics: { trustScore: req.body.analytics?.trustScore || Math.floor(Math.random() * 40) + 60, sentimentScore: req.body.review?.rating / 5 || 0.5 },
           metadata: { date: new Date().toISOString().split('T')[0] },
           location: {
               city: req.body.location?.city || 'Local',
               lat: req.body.location?.lat || 28.7041,
               lng: req.body.location?.lng || 77.1025,
               h3Index: req.body.location?.lat ? latLngToCell(req.body.location.lat, req.body.location.lng, 9) : "893da164ebfffff"
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
