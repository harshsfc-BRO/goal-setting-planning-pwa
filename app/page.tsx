import Link from "next/link";

const cards = [
  {
    href: "/goals",
    title: "Goals Master List and Plan",
    desc: "Open yearly goals, tracker sheets, milestones, and monthly links."
  },
  {
    href: "/wheel",
    title: "Wheel of Life - Activity",
    desc: "Assess life areas and capture reflection notes."
  },
  {
    href: "/monthly",
    title: "Monthly Goals and Review",
    desc: "Review monthly outcomes across all goals in one view."
  },
  {
    href: "/weekly",
    title: "Weekly Goals and Review",
    desc: "Track execution and weekly planning details."
  },
  {
    href: "/habits",
    title: "Habits (AADAT Group)",
    desc: "Jump into AADAT for daily habit execution."
  }
];

export default function HomePage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Goal Setting & Planning</h1>
        <p className="text-sm text-[#6b655d]">
          Monday coaching dashboard and weekly execution system.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-[#dfd3bf] bg-[#fff8ee] p-4 hover:bg-[#fff2db]"
          >
            <h2 className="text-lg font-medium">{card.title}</h2>
            <p className="mt-1 text-sm text-[#6b655d]">{card.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
