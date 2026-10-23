// Shown while Discover finds dogs (syllabus Unit 3: loading.tsx). Shaped like a feed card.
export default function DiscoverLoading() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-5 pt-6 sm:px-8 md:pt-10" aria-busy="true" aria-label="Finding dogs">
      <div className="mb-6 h-11 w-44 animate-pulse rounded-full bg-paper-deep" />
      <div className="overflow-hidden rounded-[28px] border border-line bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="size-11 animate-pulse rounded-full bg-paper-deep" />
          <div className="grid gap-2">
            <div className="h-4 w-32 animate-pulse rounded-full bg-paper-deep" />
            <div className="h-3 w-48 animate-pulse rounded-full bg-paper-deep" />
          </div>
        </div>
        <div className="aspect-[4/5] w-full animate-pulse bg-paper-deep" />
        <div className="grid gap-3 px-4 py-4">
          <div className="h-5 w-2/3 animate-pulse rounded-full bg-paper-deep" />
          <div className="h-5 w-1/2 animate-pulse rounded-full bg-paper-deep" />
        </div>
      </div>
    </div>
  );
}
