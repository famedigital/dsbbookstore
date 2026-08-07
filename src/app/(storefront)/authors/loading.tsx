export default function AuthorsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-6 py-12">
      <div className="h-10 w-40 rounded bg-black/10" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border bg-white/50" />
        ))}
      </div>
    </div>
  );
}
