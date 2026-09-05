import * as cheerio from 'cheerio';

/**
 * Fetches Open Graph / Twitter Card / HTML metadata for a given URL.
 * Emulates WhatsApp link-preview bot to retrieve rich cards from Amazon, Flipkart, Google Maps, etc.
 * 
 * @param {string} targetUrl - The target URL to fetch metadata for.
 * @returns {Promise<{ url: string, title: string, description: string, image: string, siteName: string } | null>}
 */
export async function fetchUrlMetadata(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string') return null;

  try {
    let url = targetUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhatsApp/2.21.12.21 A',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });

    clearTimeout(timeout);

    if (!res.ok && res.status >= 400 && res.status !== 403) {
      console.warn(`[metadataFetcher] HTTP ${res.status} for ${url}`);
    }

    const finalUrl = res.url || url;
    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract Title: prefer Open Graph title or Twitter title, fallback to HTML <title>
    let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                '';

    // Extract Description: prefer Open Graph description or Twitter description, fallback to meta description
    let description = $('meta[property="og:description"]').attr('content') ||
                      $('meta[name="twitter:description"]').attr('content') ||
                      $('meta[name="description"]').attr('content') ||
                      '';

    // Extract Image: prefer Open Graph image, Twitter image, or link rel="image_src"
    let image = $('meta[property="og:image"]').attr('content') ||
                $('meta[property="og:image:secure_url"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                $('meta[name="twitter:image:src"]').attr('content') ||
                $('link[rel="image_src"]').attr('href') ||
                '';

    // Resolve relative image URLs to absolute
    if (image && !/^https?:\/\//i.test(image)) {
      try {
        image = new URL(image, finalUrl).href;
      } catch {}
    }

    // Extract Site / Domain Name
    let siteName = $('meta[property="og:site_name"]').attr('content') || '';
    if (!siteName || siteName.length > 50) {
      try {
        siteName = new URL(finalUrl).hostname.replace(/^www\./, '');
      } catch {}
    }

    // Clean up title and description (strip newlines, collapse extra spaces)
    title = title.replace(/\s+/g, ' ').trim();
    description = description.replace(/\s+/g, ' ').trim();

    return {
      url: finalUrl,
      title,
      description,
      image,
      siteName
    };
  } catch (err) {
    console.error(`[metadataFetcher] Error fetching metadata for ${targetUrl}:`, err.message);
    return null;
  }
}
