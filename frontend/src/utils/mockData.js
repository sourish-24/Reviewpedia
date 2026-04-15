export const PRODUCT_CATEGORIES = ['Electronics', 'Home Appliances', 'Clothing', 'Automotive', 'Food & Dining', 'Beauty', 'Luggage', 'Personal Care', 'Wearables', 'Audio'];

// Helper to generate a random point near a center (rough approximation for lat/lng)
function getRandomLocation(lat, lng, radiusKm) {
  const r = radiusKm / 111.3; // Approx converting km to degrees
  const y0 = lat;
  const x0 = lng;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  const newLat = y + y0;
  const newLng = x / Math.cos(y0 * Math.PI / 180) + x0;
  return { lat: newLat, lng: newLng };
}

const names = ["Aarav", "Priya", "Vikram", "Neha", "Rohan", "Sneha", "Amit", "Kavita", "Rahul", "Anjali"];
const platforms = ["Amazon", "Flipkart", "Local Shop", "Croma", "Reliance Digital", "Nykaa", "Myntra"];

export const generateMockReviews = (centerLat, centerLng, count = 50) => {
  const reviews = [];
  let currentSharedLoc = null;

  for (let i = 0; i < count; i++) {
    // 40% chance to generate a new location, 60% chance to reuse, creating organic clusters of sizes 1-4
    if (Math.random() > 0.6 || !currentSharedLoc) {
      currentSharedLoc = getRandomLocation(centerLat, centerLng, 15); // within 15km
    }
    const loc = currentSharedLoc;

    reviews.push({
      id: i.toString(),
      lat: loc.lat,
      lng: loc.lng,
      productName: `Product ${i + 1}`,
      category: PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      summary: "This product worked exactly as expected. The delivery from " + platforms[Math.floor(Math.random() * platforms.length)] + " was fast.",
      reviewer: names[Math.floor(Math.random() * names.length)],
      trustScore: Math.floor(Math.random() * 40) + 60, // 60-100
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
    });
  }
  return reviews;
};
