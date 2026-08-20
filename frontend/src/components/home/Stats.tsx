const STATS = [
  { value: "$2.4B+", label: "In closed transactions" },
  { value: "480+", label: "Homes represented" },
  { value: "35", label: "Countries served" },
  { value: "15", label: "Years of excellence" },
];

export default function Stats() {
  return (
    <section className="bg-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center lg:text-left">
            <p className="font-display text-3xl text-accent sm:text-4xl">{stat.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
