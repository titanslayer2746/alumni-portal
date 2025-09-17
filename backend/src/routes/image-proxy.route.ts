import express from "express";
import fetch, { Response } from "node-fetch";

const router = express.Router();

/**
 * Proxy endpoint for LinkedIn profile images
 * This helps bypass CORS and ad-blocker issues
 */
router.get("/linkedin-avatar/:encodedUrl", async (req, res) => {
  try {
    const { encodedUrl } = req.params;

    // Decode the URL
    const imageUrl = decodeURIComponent(encodedUrl);

    // Validate that it's a LinkedIn image URL
    if (!imageUrl.includes("media.licdn.com")) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    // Fetch the image from LinkedIn
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Get the content type
    const contentType = response.headers.get("content-type");

    // Set appropriate headers
    res.set({
      "Content-Type": contentType || "image/jpeg",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    // Pipe the image data to the response
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.status(500).json({ error: "No image data received" });
    }
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

/**
 * Generic image proxy endpoint
 */
router.get("/image/:encodedUrl", async (req, res) => {
  try {
    const { encodedUrl } = req.params;
    const imageUrl = decodeURIComponent(encodedUrl);

    // Basic URL validation
    if (!imageUrl.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/*",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Image not found" });
    }

    const contentType = response.headers.get("content-type");

    res.set({
      "Content-Type": contentType || "image/jpeg",
      "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
      "Access-Control-Allow-Origin": "*",
    });

    if (response.body) {
      response.body.pipe(res);
    } else {
      res.status(500).json({ error: "No image data received" });
    }
  } catch (error) {
    console.error("Generic image proxy error:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

export default router;
