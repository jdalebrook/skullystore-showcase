export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: {updated}
      </p>
      <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-foreground/90 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-medium">
        {children}
      </div>
    </div>
  );
}
