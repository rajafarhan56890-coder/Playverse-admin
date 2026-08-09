import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";

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

const DEFAULT_SETTINGS: Settings = {
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
};

const SETTINGS_REF = doc(db, "settings", "global");

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [tempSettings, setTempSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Load settings from Firebase
  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setIsLoading(true);

      try {
        const snapshot = await getDoc(SETTINGS_REF);

        if (cancelled) return;

        if (snapshot.exists()) {
          const data = snapshot.data();

          const loadedSettings: Settings = {
            coinToCurrencyRate:
              typeof data.coinToCurrencyRate === "number"
                ? data.coinToCurrencyRate
                : DEFAULT_SETTINGS.coinToCurrencyRate,

            minWithdrawalAmount:
              typeof data.minWithdrawalAmount === "number"
                ? data.minWithdrawalAmount
                : DEFAULT_SETTINGS.minWithdrawalAmount,

            maxWithdrawalAmount:
              typeof data.maxWithdrawalAmount === "number"
                ? data.maxWithdrawalAmount
                : DEFAULT_SETTINGS.maxWithdrawalAmount,

            dailyRewardAmount:
              typeof data.dailyRewardAmount === "number"
                ? data.dailyRewardAmount
                : DEFAULT_SETTINGS.dailyRewardAmount,

            referralBonusReferrer:
              typeof data.referralBonusReferrer === "number"
                ? data.referralBonusReferrer
                : DEFAULT_SETTINGS.referralBonusReferrer,

            referralBonusReferred:
              typeof data.referralBonusReferred === "number"
                ? data.referralBonusReferred
                : DEFAULT_SETTINGS.referralBonusReferred,

            referralTier2Bonus:
              typeof data.referralTier2Bonus === "number"
                ? data.referralTier2Bonus
                : DEFAULT_SETTINGS.referralTier2Bonus,

            gameRewardMultiplier:
              typeof data.gameRewardMultiplier === "number"
                ? data.gameRewardMultiplier
                : DEFAULT_SETTINGS.gameRewardMultiplier,

            processingFeePercent:
              typeof data.processingFeePercent === "number"
                ? data.processingFeePercent
                : DEFAULT_SETTINGS.processingFeePercent,

            maxDailyWithdrawals:
              typeof data.maxDailyWithdrawals === "number"
                ? data.maxDailyWithdrawals
                : DEFAULT_SETTINGS.maxDailyWithdrawals,
          };

          setSettings(loadedSettings);
          setTempSettings(loadedSettings);
        } else {
          // Create the settings document automatically
          await setDoc(SETTINGS_REF, {
            ...DEFAULT_SETTINGS,
            updatedAt: serverTimestamp(),
          });

          if (!cancelled) {
            setSettings(DEFAULT_SETTINGS);
            setTempSettings(DEFAULT_SETTINGS);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);

        if (!cancelled) {
          setSaveMessage({
            text:
              error instanceof Error
                ? `❌ Failed to load settings: ${error.message}`
                : "❌ Failed to load settings.",
            type: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    key: keyof Settings,
    value: number
  ) => {
    setTempSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Basic validation
      if (tempSettings.coinToCurrencyRate < 0) {
        throw new Error("Coin conversion rate cannot be negative.");
      }

      if (tempSettings.minWithdrawalAmount < 0) {
        throw new Error("Minimum withdrawal cannot be negative.");
      }

      if (
        tempSettings.maxWithdrawalAmount <
        tempSettings.minWithdrawalAmount
      ) {
        throw new Error(
          "Maximum withdrawal must be greater than minimum withdrawal."
        );
      }

      if (tempSettings.dailyRewardAmount < 0) {
        throw new Error("Daily reward cannot be negative.");
      }

      if (tempSettings.processingFeePercent < 0) {
        throw new Error("Processing fee cannot be negative.");
      }

      if (tempSettings.maxDailyWithdrawals < 1) {
        throw new Error(
          "Maximum daily withdrawals must be at least 1."
        );
      }

      await setDoc(
        SETTINGS_REF,
        {
          ...tempSettings,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setSettings(tempSettings);
      setTempSettings(tempSettings);
      setIsEditing(false);

      setSaveMessage({
        text: "✅ Settings saved to Firebase successfully!",
        type: "success",
      });

      setTimeout(() => {
        setSaveMessage(null);
      }, 4000);
    } catch (error) {
      console.error("Failed to save settings:", error);

      setSaveMessage({
        text:
          error instanceof Error
            ? `❌ ${error.message}`
            : "❌ Error saving settings.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
    setSaveMessage(null);
  };

  const settingCategories: {
    title: string;
    settings: {
      key: keyof Settings;
      label: string;
      prefix?: string;
      suffix?: string;
    }[];
  }[] = [
    {
      title: "💰 Currency & Conversion",
      settings: [
        {
          key: "coinToCurrencyRate",
          label: "1 PKR = X Coins",
          suffix: " coins",
        },
        {
          key: "processingFeePercent",
          label: "Processing Fee",
          suffix: "%",
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
        },
        {
          key: "maxWithdrawalAmount",
          label: "Maximum Payout",
          prefix: "Rs. ",
        },
        {
          key: "maxDailyWithdrawals",
          label: "Max Daily Withdrawals",
          suffix: " times",
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
        },
        {
          key: "referralBonusReferred",
          label: "Referred User Bonus",
          suffix: " coins",
        },
        {
          key: "referralTier2Bonus",
          label: "Tier 2 Bonus (Friend of Friend)",
          suffix: " coins",
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
        },
        {
          key: "gameRewardMultiplier",
          label: "Game Reward Multiplier",
          suffix: "x",
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>
          Loading settings from Firebase...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ App Settings</h1>

          <p style={styles.subtitle}>
            Settings are stored in Firebase Firestore.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              setTempSettings(settings);
              setIsEditing(true);
              setSaveMessage(null);
            }}
            style={styles.editBtn}
          >
            Edit Settings
          </button>
        )}
      </div>

      {/* Message */}
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

      {/* Settings */}
      <div style={styles.grid}>
        {settingCategories.map((category) => (
          <div
            key={category.title}
            style={styles.section}
          >
            <h2 style={styles.sectionTitle}>
              {category.title}
            </h2>

            <div style={styles.settingsGroup}>
              {category.settings.map((setting) => {
                const currentValue =
                  tempSettings[setting.key];

                return (
                  <div
                    key={setting.key}
                    style={styles.settingRow}
                  >
                    <label style={styles.label}>
                      {setting.label}
                    </label>

                    <div style={styles.valueContainer}>
                      {!isEditing ? (
                        <div style={styles.value}>
                          {setting.prefix}
                          {currentValue}
                          {setting.suffix}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={currentValue}
                          min={0}
                          onChange={(e) =>
                            handleChange(
                              setting.key,
                              Number(e.target.value)
                            )
                          }
                          style={styles.input}
                          step={
                            setting.key ===
                            "gameRewardMultiplier"
                              ? 0.1
                              : setting.key ===
                                "coinToCurrencyRate"
                              ? 0.1
                              : setting.key ===
                                "processingFeePercent"
                              ? 0.1
                              : 1
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save / Cancel */}
      {isEditing && (
        <div style={styles.actionButtons}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...styles.saveBtn,
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving
              ? "⏳ Saving to Firebase..."
              : "💾 Save All Changes"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              ...styles.cancelBtn,
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Preview */}
      <div style={styles.previewCard}>
        <h3 style={styles.previewTitle}>
          📊 Quick Preview
        </h3>

        <div style={styles.previewGrid}>
          <div style={styles.previewItem}>
            <span>Max Earning Per Game</span>

            <strong>
              Rs.{" "}
              {(
                100 *
                settings.gameRewardMultiplier *
                settings.coinToCurrencyRate
              ).toFixed(2)}
            </strong>
          </div>

          <div style={styles.previewItem}>
            <span>Processing Fee Range</span>

            <strong>
              Rs.{" "}
              {(
                settings.minWithdrawalAmount *
                (settings.processingFeePercent / 100)
              ).toFixed(2)}{" "}
              - Rs.{" "}
              {(
                settings.maxWithdrawalAmount *
                (settings.processingFeePercent / 100)
              ).toFixed(2)}
            </strong>
          </div>

          <div style={styles.previewItem}>
            <span>Total Referral Bonus</span>

            <strong>
              {(
                settings.referralBonusReferrer +
                settings.referralBonusReferred
              ).toLocaleString()}{" "}
              coins
            </strong>
          </div>

          <div style={styles.previewItem}>
            <span>Daily Potential Earnings</span>

            <strong>
              {settings.dailyRewardAmount.toLocaleString()} coins
            </strong>
          </div>
        </div>
      </div>

      {/* Firebase location info */}
      <div style={styles.firebaseInfo}>
        <span>🔥 Firebase document:</span>
        <code>settings/global</code>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  loadingContainer: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #dee2e6",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#666",
    fontSize: "14px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "20px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
    margin: "0",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#777",
    fontSize: "13px",
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.1)",
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
    gap: "15px",
  },

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
    gap: "15px",
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
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.1)",
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
  },

  previewItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    fontSize: "13px",
    gap: "10px",
  },

  firebaseInfo: {
    marginTop: "20px",
    padding: "12px 15px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeeba",
    borderRadius: "6px",
    color: "#856404",
    fontSize: "12px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
};
