import Link from "next/link";

export type ShopEvent = {
  title: string;
  when: string;
  detail: string;
};

const FALLBACK_EVENTS: ShopEvent[] = [
  {
    title: "New arrivals on Chang Lam",
    when: "This month",
    detail:
      "Fresh titles land weekly — ask staff what’s just come in, or browse New on the site.",
  },
  {
    title: "School & reading lists",
    when: "By appointment",
    detail:
      "Build a class list online and we’ll prepare stock for pickup or quote.",
  },
];

/** Simple “this month in the shop” strip — CMS-ready via props. */
export function EventsStrip({
  events = FALLBACK_EVENTS,
}: {
  events?: ShopEvent[];
}) {
  if (!events.length) return null;

  return (
    <section className="border-y border-[color:var(--sf-line)] bg-[color:var(--sf-pine,#24352c)] py-8 text-[color:var(--sf-ivory,#f7f2e8)] md:py-10">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
              In the shop
            </p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight md:text-3xl">
              This month at DSB
            </h2>
          </div>
          <Link
            href="/visit"
            className="text-sm font-semibold tracking-wide text-[color:var(--sf-gilt,#9c7a3e)] uppercase hover:underline"
          >
            Visit Chang Lam →
          </Link>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {events.map((ev) => (
            <li
              key={ev.title}
              className="border border-white/15 bg-black/15 px-4 py-4 md:px-5"
            >
              <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
                {ev.when}
              </p>
              <h3 className="mt-1.5 font-display text-lg">{ev.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {ev.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
