import type { MetadataRoute } from "next";
import { getBreeds } from "@/lib/breeds";
import { SITE_URL } from "@/lib/site";

// /sitemap.xml: public pages plus one page per breed. Signed-in pages are left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const breeds = await getBreeds();
  const pages = ["", "/how-it-works", "/safety", "/sign-up"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const breedPages = breeds
    .filter((b) => b.slug !== "mixed")
    .map((b) => ({ url: `${SITE_URL}/breeds/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...pages, ...breedPages];
}
