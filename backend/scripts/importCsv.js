import fs from 'fs';
import mongoose from 'mongoose';
import { latLngToCell } from 'h3-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import Review from '../models/Review.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reviewpedia';

function parseCSVLine(line) {
    const chars = line.split('');
    const fields = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            fields.push(field);
            field = '';
        } else {
            field += c;
        }
    }
    fields.push(field);
    return fields;
}

const importData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to MongoDB at ${MONGODB_URI}`);

        const csvPath = path.join(process.cwd(), '../final_cleaned_reviews.csv');
        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        
        const lines = fileContent.split('\n').filter(l => l.trim() !== '');
        const headers = parseCSVLine(lines[0]);
        lines.shift();

        const reviewsToInsert = [];

        for (const line of lines) {
            const fields = parseCSVLine(line);
            if (fields.length < headers.length) continue;

            const row = {};
            headers.forEach((h, i) => { row[h.trim()] = fields[i]?.trim(); });

            const images = row.image_link && row.image_link !== 'NaN' && row.image_link.startsWith('http') 
                           ? [{ type: 'image', url: row.image_link }] 
                           : [];

            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);
            const r = parseInt(row.rating) || 0;
            
            let sentiment = (r / 5);
            if (r === 5) sentiment = 0.94;
            if (r === 1) sentiment = 0.1;

            const reviewDoc = new Review({
                product: {
                    name: row.product_name,
                    category: "electronics"
                },
                review: {
                    title: row.review_title,
                    text: row.review_text,
                    rating: r,
                    media: images
                },
                user: {
                    name: row.name === '?' ? 'Anonymous User' : row.name
                },
                source: {
                    platform: "flipkart",
                    isScraped: true
                },
                location: {
                    city: row.city,
                    lat: lat,
                    lng: lng,
                    h3Index: latLngToCell(lat, lng, 9)
                },
                metadata: {
                    date: row.date
                },
                analytics: {
                    sentimentScore: sentiment,
                    trustScore: Math.floor(Math.random() * 40) + 60,
                    demandSignals: Math.floor(Math.random() * 6)
                }
            });

            reviewsToInsert.push(reviewDoc);
        }

        console.log(`Prepared ${reviewsToInsert.length} documents. Inserting into DB...`);
        await Review.insertMany(reviewsToInsert);
        console.log("Success!");

        process.exit(0);
    } catch (err) {
        console.error("Failed to import CSV", err);
        process.exit(1);
    }
};

importData();
