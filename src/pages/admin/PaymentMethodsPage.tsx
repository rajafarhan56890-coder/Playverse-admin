import React, { useState } from "react";

interface Settings {
  coinToCurrencyRate: number;
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  dailyRewardAmount: number;
  referralBonusReferrer: number;
  referralBonusReferred: number;
  referralTier2Bonus: number;
  gameRewardMultiplier: number;
  processingFeePercent: number;
  maxDailyWithdrawals: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    coinToCurrencyRate: 0.5,
    minWithdrawalAmount: 100,
    maxWithdrawalAmount: 500000,
    dailyRewardAmount: 10,
    referralBonusReferrer: 100,
    referralBonusReferred: 100,
    referralTier2Bonus: 50,
    gameRewardMultiplier: 1.0,
    processingFeePercent: 2.5,
    maxDailyWithdrawals: 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (key: keyof Settings, value: number) => {
    setTempSettings({ ...tempSettings, [key]: value });
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSettings(tempSettings);
      setIsEditing(false);
      setSaveMessage({ text: "✅ Settings saved successfully!", type: "success" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ text: "❌ Error saving settings", type: "error" });
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  const settingCategories = [
    {
      title: "💰 Currency & Conversion",
      settings: [
        {
          key: "coinToCurrencyRate",
          label: "1 PKR = X Coins",
          suffix: " coins",
          type: "number",
        },
        {
          key: "processingFeePercent",
          label: "Processing Fee",
          suffix: "%",
          type: "number",
        },
      ],
    },
    {
      title: "🏦 Withdrawal Settings",
      settings: [
        {
          key: "minWithdrawalAmount",
          label: "Minimum Payout",
          prefix: "Rs. ",
          type: "number",
        },
        {
          key: "maxWithdrawalAmount",
          label: "Maximum Payout",
          prefix: "Rs. ",
          type: "number",
        },
        {
          key: "maxDailyWithdrawals",
          label: "Max Daily Withdrawals",
          suffix: " times",
          type: "number",
        },
      ],
    },
    {
      title: "🎁 Referral Program",
      settings: [
        {
          key: "referralBonusReferrer",
          label: "Referrer Bonus",
          suffix: " coins",
          type: "number",
        },
        {
          key: "referralBonusReferred",
          label: "Referred User Bonus",
          suffix: " coins",
          type: "number",
        },
        {
          key: "referralTier2Bonus",
          label: "Tier 2 Bonus (Friend of Friend)",
          suffix: " coins",
          type: "number",
        },
      ],
    },
    {
      title: "🎮 Games & Rewards",
      settings: [
        {
          key: "dailyRewardAmount",
          label: "Daily Reward",
          suffix: " coins",
          type: "number",
        },
        {
          key: "gameRewardMultiplier",
          label: "Game Reward Multiplier",
          suffix: "x",
          type: "number",
        },
      ],
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ App Settings</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            Edit Settings
          </button>
        )}
      </div>

      {saveMessage && (
        <div
          style={{
            ...styles.message,
            backgroundColor:
              saveMessage.type === "success"
                ? "#d4edda"
                : "#f8d7da",
            color:
              saveMessage.type === "success"
                ? "#155724"
                : "#721c24",
            borderColor:
              saveMessage.type === "success"
                ? "#c3e6cb"
                : "#f5c6cb",
          }}
        >
          {saveMessage.text}
        </div>
      )}

      <div style={styles.grid}>
        {settingCategories.map((category, idx) => (
          <div key={idx} style={styles.section}>
            <h2 style={styles.sectionTitle}>{category.title}</h2>

            <div style={styles.settingsGroup}>
              {category.settings.map((setting) => (
                <div key={setting.key} style={styles.settingRow}>
                  <label style={styles.label}>{setting.label}</label>
                  <div style={styles.valueContainer}>
                    {!isEditing ? (
                      <div style={styles.value}>
                        {setting.prefix}
                        {tempSettings[setting.key as keyof Settings]}
                        {setting.suffix}
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={
                          tempSettings[setting.key as keyof Settings]
                        }
                        onChange={(e) =>
                          handleChange(
                            setting.key as keyof Settings,
                            Number(e.target.value)
                          )
                        }
                        style={styles.input}
                        step={
                          setting.key === "gameRewardMultiplier" ? 0.1 : 1
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div style={styles.actionButtons}>
          <button onClick={handleSave} style={styles.saveBtn}>
            💾 Save All Changes
          </button>
          <button onClick={handleCancel} style={styles.cancelBtn}>
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Settings Preview */}
      <div style={styles.previewCard}>
        <h3 style={styles.previewTitle}>📊 Quick Preview</h3>
        <div style={styles.previewGrid}>
          <div style={styles.previewItem}>
            <span>Max Earning Per Game</span>
            <strong>
              Rs. {(100 * settings.gameRewardMultiplier * settings.coinToCurrencyRate).toFixed(2)}
            </strong>
          </div>
          <div style={styles.previewItem}>
            <span>Processing Fee Range</span>
            <strong>
              Rs. {(settings.minWithdrawalAmount * (settings.processingFeePercent / 100)).toFixed(2)} - Rs. {(settings.maxWithdrawalAmount * (settings.processingFeePercent / 100)).toFixed(2)}
            </strong>
          </div>
          <div style={styles.previewItem}>
            <span>Total Referral Bonus</span>
            <strong>
              {settings.referralBonusReferrer + settings.referralBonusReferred} coins
            </strong>
          </div>
          <div style={styles.previewItem}>
            <span>Daily Potential Earnings</span>
            <strong>{settings.dailyRewardAmount} coins</strong>
          </div>
        </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  },
  editBtn: {
    padding: "12px 20px",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  message: {
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid",
    fontSize: "14px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "20px",
    color: "#333",
    paddingBottom: "10px",
    borderBottom: "2px solid #007bff",
  },
  settingsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px" as const,
  },
  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  valueContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  value: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#007bff",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #dee2e6",
    borderRadius: "5px",
    fontSize: "14px",
    fontFamily: "inherit",
    width: "150px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
  },
  saveBtn: {
    padding: "12px 30px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  cancelBtn: {
    padding: "12px 30px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  previewTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "0",
    marginBottom: "15px",
    color: "#333",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },
  previewItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    fontSize: "13px",
  },
};
