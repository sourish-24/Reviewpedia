import Review from '../models/Review.js';

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
           reviewer: req.body.reviewer || 'LocalUser' + Math.floor(Math.random() * 999),
           trustScore: req.body.trustScore || Math.floor(Math.random() * 40) + 60,
           date: new Date().toISOString().split('T')[0]
        });
        await newReview.save();
        
        const rObj = newReview.toObject();
        rObj.id = rObj._id.toString();
        
        res.status(201).json(rObj);
    } catch (err) {
        next(err);
    }
};
