const axios = require("axios");
const cheerio = require("cheerio");

async function testSpecificTikTokURL() {
  const testUrl =
    "https://www.tiktok.com/@molinerd/video/7340413638353800454?lang=es";

  try {
    // Método 1: oEmbed
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
      testUrl
    )}`;

    try {
      const oembedResponse = await axios.get(oembedUrl, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        },
      });

      if (oembedResponse.data && oembedResponse.data.thumbnail_url) {
        const thumbnailUrl = oembedResponse.data.thumbnail_url;

        // Verificar accesibilidad
        try {
          const headResponse = await axios.head(thumbnailUrl, {
            timeout: 10000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          return thumbnailUrl;
        } catch (verifyError) {
          return thumbnailUrl; // Retornar de todas formas
        }
      } else {
      }
    } catch (oembedError) {
      if (oembedError.response) {
      }
    }

    // Método 2: Web Scraping
    try {
      const response = await axios.get(testUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "max-age=0",
        },
        timeout: 20000,
      });

      const $ = cheerio.load(response.data);

      // Buscar meta tags
      const metaTags = {
        "og:image": $('meta[property="og:image"]').attr("content"),
        "twitter:image": $('meta[name="twitter:image"]').attr("content"),
        "og:image:secure_url": $('meta[property="og:image:secure_url"]').attr(
          "content"
        ),
      };

      // Buscar en JSON-LD
      $('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html() || "{}");
          if (jsonData.thumbnailUrl) {
            return jsonData.thumbnailUrl;
          }
        } catch (e) {}
      });

      // Buscar en scripts
      const scripts = $("script").toArray();

      let foundImages = [];

      for (let i = 0; i < Math.min(scripts.length, 10); i++) {
        const scriptContent = $(scripts[i]).html() || "";

        if (scriptContent.length > 1000 && scriptContent.includes("tiktok")) {
          // Patrones más específicos
          const patterns = [
            /https:\/\/[^"'\s]+\.tiktokcdn[^"'\s]*\.(jpg|jpeg|png|webp|avif)/gi,
            /"cover":"([^"]+)"/g,
            /"dynamicCover":"([^"]+)"/g,
            /"originCover":"([^"]+)"/g,
            /"thumbnail_url":"([^"]+)"/g,
          ];

          patterns.forEach((pattern, patternIndex) => {
            const matches = [...scriptContent.matchAll(pattern)];
            if (matches.length > 0) {
              matches.slice(0, 3).forEach((match, matchIndex) => {
                const url = match[1] || match[0];
                const cleanUrl = url
                  .replace(/\\u0026/g, "&")
                  .replace(/\\/g, "");
                if (
                  cleanUrl.startsWith("http") &&
                  cleanUrl.includes("tiktok")
                ) {
                  foundImages.push(cleanUrl);
                }
              });
            }
          });
        }
      }

      if (foundImages.length > 0) {
        foundImages.forEach((img, i) => {});
        return foundImages[0];
      }
    } catch (scrapingError) {}

    return null;
  } catch (error) {
    console.error("❌ Error general:", error.message);
    return null;
  }
}

testSpecificTikTokURL()
  .then((result) => {})
  .catch(console.error);
