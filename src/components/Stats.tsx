const STATS = [
  { value: "25.000+", label: "Doğrulanmış usta" },
  { value: "180.000+", label: "Tamamlanan iş" },
  { value: "%99", label: "Memnuniyet oranı" },
  { value: "0 ₺", label: "Ödeme kaybı" },
];

export function Stats() {
  return (
    <section className="container-page py-6">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:grid-cols-4 sm:p-8">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-navy-500 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
