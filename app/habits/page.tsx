import Link from "next/link";

const aadatUrl = "https://meriaadat.netlify.app";

export default function HabitsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Habits (AADAT Group)</h1>
      <p className="text-sm text-[#6b655d]">
        This bridge opens habits tracking in your AADAT app.
      </p>
      <Link
        href={aadatUrl}
        className="inline-flex rounded-md px-4 py-2 text-sm button-brand"
        target="_blank"
      >
        Open AADAT Group
      </Link>
      <p className="text-xs text-[#6b655d]">
        Opens your live AADAT habits app in a new tab.
      </p>
    </section>
  );
}
