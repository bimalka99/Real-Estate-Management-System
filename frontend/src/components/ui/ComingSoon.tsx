export default function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h1 className="font-display mt-4 text-4xl text-foreground sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-lg text-sm text-muted">{description}</p>
      <div className="divider-accent mt-8" />
    </div>
  );
}
