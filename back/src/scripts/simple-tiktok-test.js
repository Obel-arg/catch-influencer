const axios = require("axios");
const cheerio = require("cheerio");

class SimpleTikTokExtractor {
  static async getThumbnail(url) {
    try {
      // Método 1: Intentar oEmbed primero
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        url
      )}`;

      try {
        const oembedResponse = await axios.get(oembedUrl, {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (oembedResponse.data && oembedResponse.data.thumbnail_url) {
          return oembedResponse.data.thumbnail_url;
        }
      } catch (oembedError) {}

      // Método 2: Web scraping
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Buscar meta tags
      const ogImage = $('meta[property="og:image"]').attr("content");
      const twitterImage = $('meta[name="twitter:image"]').attr("content");

      if (ogImage && ogImage.includes("tiktok")) {
        return ogImage;
      }

      if (twitterImage && twitterImage.includes("tiktok")) {
        return twitterImage;
      }

      // Buscar en scripts
      const scripts = $("script").toArray();

      for (let script of scripts) {
        const scriptContent = $(script).html() || "";

        // Buscar patrones de imágenes
        const imagePatterns = [
          /https:\/\/[^"'\s]+\.tiktokcdn\.com[^"'\s]+\.(jpg|jpeg|png|webp|avif)/gi,
          /"cover":"([^"]+)"/g,
          /"dynamicCover":"([^"]+)"/g,
          /"originCover":"([^"]+)"/g,
        ];

        for (let pattern of imagePatterns) {
          const matches = [...scriptContent.matchAll(pattern)];
          if (matches.length > 0) {
            const imageUrl = matches[0][1] || matches[0][0];
            const cleanUrl = imageUrl
              .replace(/\\u0026/g, "&")
              .replace(/\\/g, "");

            if (cleanUrl.startsWith("http")) {
              return cleanUrl;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Error:", error.message);
      return null;
    }
  }
}

// Probar con URLs reales
async function test() {}

test().catch(console.error);
