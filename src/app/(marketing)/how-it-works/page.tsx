import type { Metadata } from "next";
import { Block, ClosingLink, PageIntro } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Pawred matches dogs: health-first profiles, breed-aware rules, likes with a reason, and chat once both owners agree.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro
        title="How Pawred works"
        lead="Four steps, from a good profile to a meeting both owners feel sure about. No swiping through hundreds of strangers."
      />

      <Block title="1. Make a profile worth reading">
        <p>
          Add your dog&apos;s <strong>breed, sex, date of birth and city</strong>, then three to six photos and three short prompts in your
          dog&apos;s voice. Owners like specific things, so the more specific you are, the better your likes will be.
        </p>
        <p>
          Then the health part: tick whether vaccinations are up to date and upload any <strong>vaccination card, hip score, genetic test or
          pedigree</strong>. A Pawred admin checks them, and approved documents earn the Verified badge.
        </p>
      </Block>

      <Block title="2. Discover compatible dogs" tone="deep">
        <p>Discover only shows dogs that make sense for breeding:</p>
        <ul className="grid list-disc gap-2 pl-6">
          <li>
            <strong>Opposite sex</strong> only.
          </li>
          <li>
            <strong>Same breed</strong>, unless both owners have switched on &ldquo;open to other breeds&rdquo;.
          </li>
          <li>
            <strong>At least 18 months old</strong>, with a finished profile.
          </li>
        </ul>
        <p>You can narrow it further to verified dogs or dogs in your city.</p>
      </Block>

      <Block title="3. Like with a reason">
        <p>
          Instead of swiping, tap the heart on <strong>one photo or one prompt</strong> and add a line about why. The other owner sees exactly
          what caught your eye. Not interested? Skip, and that dog won&apos;t come up again.
        </p>
        <p>
          Owners who liked your dog appear in <strong>Likes you</strong>. Like them back and it&apos;s a match.
        </p>
      </Block>

      <Block title="4. Match, talk, then meet" tone="felt">
        <p>
          A match opens a private chat. Use it to <strong>share papers, ask your vets, and agree on terms</strong> before anyone meets. If it
          isn&apos;t right, unmatch at any time and the chat closes.
        </p>
        <p>When you do meet, choose a public place, bring a friend, and let the dogs set the pace.</p>
      </Block>

      <ClosingLink title="Ready to find your dog's match?" href="/sign-up" label="Create your dog's profile" />
    </>
  );
}
