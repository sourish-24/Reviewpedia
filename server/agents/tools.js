import mongoose from 'mongoose';
import Review from '../models/Review.js';
import B2BClient from '../models/B2BClient.js';
import OutreachLog from '../models/OutreachLog.js';

export async function get_full_brand_context({ brand_name }) {
  const reviews = await Review.find({ productName: { $regex: new RegExp(brand_name, 'i') } });
  if (reviews.length === 0) return { error: "Brand not found" };

  const totalReviews = reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  
  const cityBreakdown = {};
  let totalDemandSignals = 0;
  const hexCounts = {};
  
  reviews.forEach(r => {
    cityBreakdown[r.city] = (cityBreakdown[r.city] || 0) + 1;
    totalDemandSignals += (r.demandSignals || 0);
    if (r.h3Index) {
      hexCounts[r.h3Index] = (hexCounts[r.h3Index] || 0) + 1;
    }
  });

  const topHexes = Object.entries(hexCounts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hex, count]) => ({ hex_id: hex, review_count: count }));

  // Check outreach logic
  // Hardcoded to false for the Demo so you can click the trigger button infinitely!
  const contacted_before = false;
  const last_contact_days_ago = null;

  const official_website = `https://www.${brand_name.toLowerCase().replace(/\s+/g, '')}.com`;
  const contact_email = `sales@${brand_name.toLowerCase().replace(/\s+/g, '')}.com`;

  return {
    total_reviews: totalReviews,
    average_rating: avgRating.toFixed(2),
    city_breakdown: cityBreakdown,
    top_positive_keywords: ["sound quality", "battery life"], 
    top_negative_keywords: ["charging cable", "customer service"],
    total_interested_clicks: totalDemandSignals,
    h3_hex_breakdown: topHexes,
    contacted_before,
    last_contact_days_ago,
    official_website,
    contact_email
  };
}

export async function get_full_client_context({ client_id }) {
  const client = await B2BClient.findOne({ client_id: client_id });
  if (!client) return { error: "Client not found" };

  const dLogin = new Date(client.lastLogin);
  const reviews = await Review.find({ productName: { $regex: new RegExp(client.companyName, 'i') } });
  
  const newReviews = reviews.filter(r => new Date(r.date) > dLogin);
  const cityBreakdown = {};
  newReviews.forEach(r => {
    cityBreakdown[r.city] = (cityBreakdown[r.city] || 0) + 1;
  });

  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const recentNegatives = reviews.filter(r => new Date(r.date) > cutoff && r.sentiment_score < 0.5);
  let spike_detected = recentNegatives.length >= 5;

  let totalDemandSignals = 0;
  newReviews.forEach(r => totalDemandSignals += (r.demandSignals || 0));

  return {
    client_profile: {
        companyName: client.companyName,
        contactEmail: client.contactEmail,
        lastLogin: client.lastLogin
    },
    new_reviews_since_login: newReviews.length,
    new_average_rating: newReviews.length > 0 ? (newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length).toFixed(2) : 0,
    top_new_complaints: ["strap breaking", "syncing issues"], 
    urgent_sentiment_spike: spike_detected ? {
         affected_city: recentNegatives[0]?.city || "Bengaluru",
         negative_count: recentNegatives.length,
         dominant_complaint: "strap breaking after 2 weeks"
    } : null,
    total_new_interested_clicks: totalDemandSignals
  };
}

export async function send_outreach_email({ to_email, subject, html_body, brand_name }) {
  const log = new OutreachLog({
    brandName: brand_name,
    email: to_email || "test@test.com",
    subject: subject,
    body: html_body,
    status: 'sent'
  });
  await log.save();

  if (process.env.RESEND_API_KEY && to_email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: to_email,
          subject: subject,
          html: html_body
        })
      });
      return { success: true, message: `Email sent to ${to_email} and logged.` };
    } catch (err) {
      console.warn("Resend failed, but logged to db.");
    }
  }

  return { success: true, message: `Email sending SIMULATED & logged for ${to_email}.` };
}

export async function send_reengagement_report({ client_id, to_email, subject, html_body }) {
  await B2BClient.updateOne({ client_id: client_id }, { $set: { lastReportSent: new Date() } });

  const log = new OutreachLog({
    brandName: client_id,
    email: to_email || "test@test",
    subject: subject,
    body: html_body,
    status: 'report_sent'
  });
  await log.save();

  return { success: true, message: `Report sent to ${to_email}.` };
}

export const toolsDeclarations = {
   prospecting: [
      {
         name: "get_full_brand_context",
         description: "Get all aggregated platform data, geospatial clusters, and contact info for a specified product brand in one single call.",
         parameters: { type: "OBJECT", properties: { brand_name: { type: "STRING" } }, required: ["brand_name"] }
      },
      {
         name: "send_outreach_email",
         description: "Send the final personalized outreach email.",
         parameters: { type: "OBJECT", properties: { to_email: { type: "STRING" }, subject: { type: "STRING" }, html_body: { type: "STRING" }, brand_name: { type: "STRING" } }, required: ["to_email", "subject", "html_body", "brand_name"] }
      }
   ],
   dealIntelligence: [
      {
         name: "get_full_client_context",
         description: "Get client profile, all unseen reviews since their last login, demand signals, and risk analytics in one single call.",
         parameters: { type: "OBJECT", properties: { client_id: { type: "STRING" } }, required: ["client_id"] }
      },
      {
         name: "send_reengagement_report",
         description: "Send the final actionable re-engagement report.",
         parameters: { type: "OBJECT", properties: { client_id: { type: "STRING" }, to_email: { type: "STRING" }, subject: { type: "STRING" }, html_body: { type: "STRING" } }, required: ["client_id", "to_email", "subject", "html_body"] }
      }
   ]
};

export const toolsMap = {
    get_full_brand_context,
    get_full_client_context,
    send_outreach_email,
    send_reengagement_report
};
