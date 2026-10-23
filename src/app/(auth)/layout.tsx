import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/site/Wordmark";
import { photos } from "@/lib/sample-data";

// Split screen: photo on the left (desktop), form on the right.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="relative hidden bg-felt md:block">
        <Image
          src={`${photos.goldenPair}?w=1200&q=75`}
          alt="Two golden retrievers lying side by side"
          fill
          sizes="50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" aria-label="Pawred home" className="self-start">
          <Wordmark />
        </Link>
        <main className="flex flex-1 items-center py-10">{children}</main>
      </div>
    </div>
  );
}
