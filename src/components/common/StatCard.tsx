interface Props {
  label: string;
  value: string | number;
  accent?: "default" | "coin" | "warning" | "success";
}

const ACCENT_CLASS: Record<NonNullable<Props["accent"]>, string> = {
  default: "text-pv-text",
  coin: "text-pv-coin",
  warning: "text-yellow-400",
  success: "text-pv-success",
};

export default function StatCard({ label, value, accent = "default" }: Props) {
  return (
    <div className="bg-pv-elevated border border-pv-border rounded-2xl p-4">
      <p className="text-xs text-pv-textSecondary">{label}</p>
      <p className={`text-2xl font-display font-semibold mt-1 ${ACCENT_CLASS[accent]}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
