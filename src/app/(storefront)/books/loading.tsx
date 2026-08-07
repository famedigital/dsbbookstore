export default function BooksLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-6 py-12">
      <div className="h-10 w-48 rounded bg-black/10" />
      <div className="mt-3 h-4 w-72 rounded bg-black/5" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] rounded-sm bg-black/10" />
            <div className="h-4 w-3/4 rounded bg-black/10" />
            <div className="h-3 w-1/2 rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
