import React, { useEffect, useState } from "react";
import { useState as useStateAdmin } from "react";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([
    {
      id: "easypaisa",
      name: "EasyPaisa",
      enabled: true,
      minPayout: 100,
      maxPayout: 500000,
      fee: 2.5,
    },
    {
      id: "jazzcash",
      name: "JazzCash",
      enabled: true,
      minPayout: 100,
      maxPayout: 500000,
      fee: 2.5,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      enabled: true,
      minPayout: 500,
      maxPayout: 1000000,
      fee: 1.0,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    minPayout: 0,
    maxPayout: 0,
    fee: 0,
  });

  const handleEdit = (method: (typeof methods)[0]) => {
    setEditingId(method.id);
    setFormData({
      minPayout: method.minPayout,
      maxPayout: method.maxPayout,
      fee: method.fee,
    });
  };

  const handleSave = () => {
    setMethods(
      methods.map((m) =>
        m.id === editingId
          ? {
              ...m,
              minPayout: formData.minPayout,
              maxPayout: formData.maxPayout,
              fee: formData.fee,
            }
          : m
      )
    );
    setEditingId(null);
  };

  const handleToggle = (id: string) => {
    setMethods(
      methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💳 Payment Methods</h1>

      <div style={styles.grid}>
        {methods.map((method) => (
          <div key={method.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.methodName}>{method.name}</h3>
              <button
                onClick={() => handleToggle(method.id)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: method.enabled ? "#28a745" : "#dc3545",
                }}
              >
                {method.enabled ? "✓ Enabled" : "✕ Disabled"}
              </button>
            </div>

            {editingId === method.id ? (
              <div style={styles.form}>
                <div style={styles.formGroup}>
                  <label>Min Payout</label>
                  <input
                    type="number"
                    value={formData.minPayout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPayout: Number(e.target.value),
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Max Payout</label>
                  <input
                    type="number"
                    value={formData.maxPayout}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxPayout: Number(e.target.value),
                      })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Processing Fee (%)</label>
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
                    style={styles.input}
                  />
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    onClick={handleSave}
                    style={{
                      ...styles.btn,
                      backgroundColor: "#007bff",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      ...styles.btn,
                      backgroundColor: "#6c757d",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.info}>
                <div style={styles.infoRow}>
                  <span>Min Payout:</span>
                  <strong>Rs. {method.minPayout.toLocaleString()}</strong>
                </div>
                <div style={styles.infoRow}>
                  <span>Max Payout:</span>
                  <strong>Rs. {method.maxPayout.toLocaleString()}</strong>
                </div>
                <div style={styles.infoRow}>
                  <span>Fee:</span>
                  <strong>{method.fee}%</strong>
                </div>
                <button
                  onClick={() => handleEdit(method)}
                  style={{
                    ...styles.btn,
                    backgroundColor: "#17a2b8",
                    marginTop: "15px",
                    width: "100%",
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid #dee2e6",
  },
  methodName: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  },
  toggleBtn: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px" as const,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px" as const,
  },
  input: {
    padding: "10px",
    border: "1px solid #dee2e6",
    borderRadius: "5px",
    fontSize: "14px",
    fontFamily: "inherit",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  btn: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    flex: 1,
    fontSize: "14px",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: "10px" as const,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
};
