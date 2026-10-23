import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /robots.txt: let search engines read the public site, not the signed-in app.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/discover", "/likes", "/matches", "/dogs/", "/onboarding", "/settings"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
