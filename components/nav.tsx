import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/goals", label: "Goals Master List" },
  { href: "/wheel", label: "Wheel of Life" },
  { href: "/monthly", label: "Monthly Review" },
  { href: "/weekly", label: "Weekly Review" },
  { href: "/habits", label: "Habits" }
];

export function Nav() {
  return (
    <nav className="panel p-3">
      <ul className="grid grid-cols-2 gap-2 md:flex md:flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="block rounded-md border border-[#e6dcc9] px-3 py-2 text-sm hover:bg-[#f4ecdc]"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
