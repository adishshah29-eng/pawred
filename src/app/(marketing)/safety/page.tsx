import type { Metadata } from "next";
import { Block, ClosingLink, PageIntro } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Health & safety",
  description: "How Pawred keeps matchmaking responsible: verified health documents, breeding rules, reporting, and tips for meeting safely.",
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return (
    <>
      <PageIntro
        title="The paperwork comes before the playdate."
        lead="Responsible breeding starts with healthy dogs and honest owners. Here's what Pawred does, and what we ask of you."
      />

      <Block title="Verified health documents">
        <p>
          Owners upload vaccination cards, hip and elbow scores, genetic tests and pedigree certificates. Documents are stored privately:{" "}
          <strong>only Pawred admins can open them</strong>. Other owners only see what was verified.
        </p>
        <p>An admin checks each document against the dog&apos;s profile before the Verified badge appears.</p>
      </Block>

      <Block title="Rules built in" tone="deep">
        <ul className="grid list-disc gap-2 pl-6">
          <li>Dogs must be at least 18 months old to be listed.</li>
          <li>Only opposite-sex, compatible dogs appear in Discover.</li>
          <li>
            <strong>No selling puppies</strong> and no commercial breeding. Profiles that do either are removed.
          </li>
          <li>One person, real dogs. Fake or borrowed photos get a profile paused.</li>
        </ul>
      </Block>

      <Block title="Report anything that feels wrong">
        <p>
          Every profile and chat has a <strong>Report</strong> option. Reports go to a Pawred admin, who can pause a dog&apos;s profile or ban an
          account. The person you report isn&apos;t told who reported them.
        </p>
        <p>You can also unmatch at any time. The chat closes and that dog won&apos;t appear for you again.</p>
      </Block>

      <Block title="Meeting safely" tone="felt">
        <ul className="grid list-disc gap-2 pl-6">
          <li>
            Ask both vets before the dogs meet. <strong>Pawred&apos;s checklists are not veterinary advice.</strong>
          </li>
          <li>Meet first in a public place, without the dogs, or with them on leads.</li>
          <li>Never send money or share bank details through the chat.</li>
          <li>Agree on terms (puppies, costs, vet visits) in writing before breeding.</li>
        </ul>
      </Block>

      <ClosingLink title="Start with a profile you're proud of" href="/sign-up" label="Create your dog's profile" />
    </>
  );
}
