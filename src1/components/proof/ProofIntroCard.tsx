interface Props {
  title: string;
  description: string;
}

export function ProofIntroCard({ title, description }: Props) {
  return (
    <section className="overflow-hidden rounded-b-md border-[0.5px] border-emerald-200 bg-card">
      <div className="h-1 bg-emerald-600" aria-hidden />
      <div className="px-6 py-5">
        <h1 className="text-lg font-bold text-emerald-800 [font-family:Arial,Helvetica,sans-serif]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-emerald-900/80">
          {description}
        </p>
      </div>
    </section>
  );
}
