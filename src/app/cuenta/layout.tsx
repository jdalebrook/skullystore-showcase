import Link from "next/link";

const links = [
  { href: "/cuenta", label: "Perfil" },
  { href: "/cuenta/direcciones", label: "Direcciones" },
  { href: "/cuenta/pedidos", label: "Pedidos" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Mi cuenta
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[160px_1fr]">
        <nav aria-label="Navegación de la cuenta">
          <ul className="flex flex-row flex-wrap gap-x-4 gap-y-2 md:flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
