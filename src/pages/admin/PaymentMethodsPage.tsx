import { useEffect, useState } from "react";
import {
  fetchPaymentMethods,
  updatePaymentMethod,
  type PaymentMethod,
} from "../../services/paymentMethods.service";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    minPayout: 0,
    maxPayout: 0,
    fee: 0,
  });

  const [error, setError] = useState<string | null>(null);

  async function loadMethods() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error("Failed to load payment methods:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load payment methods."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
  }, []);

  function handleEdit(method: PaymentMethod) {
    setEditingId(method.id);

    setFormData({
      minPayout: method.minPayout,
      maxPayout: method.maxPayout,
      fee: method.fee,
    });
  }

  async function handleSave(method: PaymentMethod) {
    try {
      setSavingId(method.id);

      await updatePaymentMethod(method.id, {
        minPayout: formData.minPayout,
        maxPayout: formData.maxPayout,
        fee: formData.fee,
      });

      setMethods((prev) =>
        prev.map((item) =>
          item.id === method.id
            ? {
                ...item,
                minPayout: formData.minPayout,
                maxPayout: formData.maxPayout,
                fee: formData.fee,
              }
            : item
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error("Failed to save payment method:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not save payment method."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(method: PaymentMethod) {
    try {
      setSavingId(method.id);

      const newEnabled = !method.enabled;

      await updatePaymentMethod(method.id, {
        enabled: newEnabled,
      });

      setMethods((prev) =>
        prev.map((item) =>
          item.id === method.id
            ? {
                ...item,
                enabled: newEnabled,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to toggle payment method:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not update payment method."
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold text-pv-text">
          Payment Methods
        </h1>

        <p className="text-sm text-pv-textSecondary mt-1">
          Manage withdrawal payment methods and processing fees.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>

          <button
            onClick={loadMethods}
            className="text-xs text-red-300 mt-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {methods.map((method) => {
          const isEditing = editingId === method.id;
          const isSaving = savingId === method.id;

          return (
            <div
              key={method.id}
              className="bg-pv-elevated border border-pv-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-pv-border">
                <div>
                  <h3 className="text-lg font-semibold text-pv-text">
                    {method.name}
                  </h3>

                  <p className="text-xs text-pv-textMuted mt-1">
                    {method.id}
                  </p>
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => handleToggle(method)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-50 ${
                    method.enabled
                      ? "bg-pv-success/20 text-pv-success"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isSaving
                    ? "Saving..."
                    : method.enabled
                    ? "✓ Enabled"
                    : "✕ Disabled"}
                </button>
              </div>

              {isEditing ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs text-pv-textSecondary mb-1">
                      Minimum Payout
                    </label>

                    <input
                      type="number"
                      value={formData.minPayout}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPayout: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-pv-textSecondary mb-1">
                      Maximum Payout
                    </label>

                    <input
                      type="number"
                      value={formData.maxPayout}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxPayout: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-pv-textSecondary mb-1">
                      Processing Fee (%)
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      value={formData.fee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fee: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      disabled={isSaving}
                      onClick={() => handleSave(method)}
                      className="flex-1 rounded-lg bg-pv-primary text-pv-bg py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                      disabled={isSaving}
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-lg bg-pv-elevated2 text-pv-text py-2 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-pv-textSecondary">
                        Min Payout
                      </span>

                      <strong className="text-sm text-pv-text">
                        Rs. {method.minPayout.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-pv-textSecondary">
                        Max Payout
                      </span>

                      <strong className="text-sm text-pv-text">
                        Rs. {method.maxPayout.toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-pv-textSecondary">
                        Processing Fee
                      </span>

                      <strong className="text-sm text-pv-text">
                        {method.fee}%
                      </strong>
                    </div>
                  </div>

                  <button
                    disabled={isSaving}
                    onClick={() => handleEdit(method)}
                    className="w-full mt-5 rounded-lg bg-pv-elevated2 text-pv-primary py-2 text-sm font-medium hover:bg-pv-border disabled:opacity-50"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
