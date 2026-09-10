export function BarList({ items }: { items: { label: string; value: number }[] }) {
  if (items.length === 0)
    return <p className="text-sm text-navy-400">Henüz veri yok.</p>;

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i}>
          <div className="mb-0.5 flex items-center justify-between text-xs text-navy-600">
            <span className="truncate">{it.label}</span>
            <span className="font-semibold text-navy-800">{it.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.max(4, (it.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
