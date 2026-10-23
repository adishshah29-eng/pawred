import type { Metadata } from "next";
import { Figtree, Gloock } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const gloock = Gloock({
  variable: "--font-gloock",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pawred — careful matchmaking for dogs",
    template: "%s · Pawred",
  },
  description:
    "Find a healthy, compatible mate for your dog. Health-checked profiles, breed-aware matching and likes that say why.",
  openGraph: {
    title: "Pawred — careful matchmaking for dogs",
    description:
      "Health-checked profiles, breed-aware matching and likes that say why.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${gloock.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
