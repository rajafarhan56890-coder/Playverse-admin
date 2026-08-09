import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  fetchAppSettings,
  saveAppSettings,
  type AppSettings,
} from "../../services/settings.service";

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  const [tempSettings, setTempSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  async function loadSettings() {
    try {
      setIsLoading(true);

      const data = await fetchAppSettings();

      setSettings(data);
      setTempSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);

      setSaveMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not load settings.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (
    key: keyof AppSettings,
    value: number
  ) => {
    setTempSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  async function handleSave() {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      await saveAppSettings(tempSettings);

      setSettings(tempSettings);
      setTempSettings(tempSettings);
      setIsEditing(false);

      setSaveMessage({
        text: "✅ Settings saved to Firebase successfully!",
        type: "success",
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);

      setSaveMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not save settings.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setTempSettings(settings);
    setIsEditing(false);
    setSaveMessage(null);
  }

  const settingCategories = [
    {
      title: "💰 Currency & Conversion",
      settings: [
        {
          key: "coinToCurrencyRate" as keyof AppSettings,
          label: "1 PKR = X Coins",
          suffix: " coins",
        },
        {
          key: "processingFeePercent" as keyof AppSettings,
          label: "Processing Fee",
          suffix: "%",
        },
      ],
    },
    {
      title: "🏦 Withdrawal Settings",
      settings: [
        {
          key: "minWithdrawalAmount" as keyof AppSettings,
          label: "Minimum Payout",
          prefix: "Rs. ",
        },
        {
          key: "maxWithdrawalAmount" as keyof AppSettings,
          label: "Maximum Payout",
          prefix: "Rs. ",
        },
        {
          key: "maxDailyWithdrawals" as keyof AppSettings,
          label: "Max Daily Withdrawals",
          suffix: " times",
        },
      ],
    },
    {
      title: "🎁 Referral Program",
      settings: [
        {
          key: "referralBonusReferrer" as keyof AppSettings,
          label: "Referrer Bonus",
          suffix: " coins",
        },
        {
          key: "referralBonusReferred" as keyof AppSettings,
          label: "Referred User Bonus",
          suffix: " coins",
        },
        {
          key: "referralTier2Bonus" as keyof AppSettings,
          label: "Tier 2 Bonus",
          suffix: " coins",
        },
      ],
    },
    {
      title: "🎮 Games & Rewards",
      settings: [
        {
          key: "dailyRewardAmount" as keyof AppSettings,
          label: "Daily Reward",
          suffix: " coins",
        },
        {
          key: "gameRewardMultiplier" as keyof AppSettings,
          label: "Game Reward Multiplier",
          suffix: "x",
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-pv-text">
            App Settings
          </h1>

          <p className="text-sm text-pv-textSecondary mt-1">
            Manage global rewards, withdrawals and referral settings.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium"
          >
            Edit Settings
          </button>
        )}
      </div>

      {saveMessage && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            saveMessage.type === "success"
              ? "bg-pv-success/10 border-pv-success/30 text-pv-success"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {settingCategories.map((category) => (
          <div
            key={category.title}
            className="bg-pv-elevated border border-pv-border rounded-2xl p-5"
          >
            <h2 className="text-lg font-semibold text-pv-text pb-4 border-b border-pv-border">
              {category.title}
            </h2>

            <div className="mt-4 space-y-4">
              {category.settings.map((setting) => {
                const value =
                  tempSettings[setting.key];

                return (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between gap-4 border-b border-pv-border/50 pb-3"
                  >
                    <label className="text-sm text-pv-textSecondary">
                      {setting.label}
                    </label>

                    {isEditing ? (
                      <input
                        type="number"
                        value={value}
                        step={
                          setting.key ===
                          "gameRewardMultiplier"
                            ? 0.1
                            : setting.key ===
                              "processingFeePercent"
                            ? 0.1
                            : 1
                        }
                        onChange={(e) =>
                          handleChange(
                            setting.key,
                            Number(e.target.value)
                          )
                        }
                        className="w-36 rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text text-right"
                      />
                    ) : (
                      <strong className="text-pv-primary text-sm">
                        {setting.prefix ?? ""}
                        {Number(value).toLocaleString()}
                        {setting.suffix ?? ""}
                      </strong>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-pv-primary text-pv-bg px-6 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "💾 Save All Changes"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-full bg-pv-elevated2 text-pv-text px-6 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-6 bg-pv-elevated border border-pv-border rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-pv-text mb-4">
          📊 Quick Preview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Preview
            label="Max Earning Per Game"
            value={`Rs. ${(
              100 *
              settings.gameRewardMultiplier *
              settings.coinToCurrencyRate
            ).toFixed(2)}`}
          />

          <Preview
            label="Processing Fee Range"
            value={`Rs. ${(
              settings.minWithdrawalAmount *
              (settings.processingFeePercent / 100)
            ).toFixed(2)} - Rs. ${(
              settings.maxWithdrawalAmount *
              (settings.processingFeePercent / 100)
            ).toFixed(2)}`}
          />

          <Preview
            label="Total Referral Bonus"
            value={`${(
              settings.referralBonusReferrer +
              settings.referralBonusReferred
            ).toLocaleString()} coins`}
          />

          <Preview
            label="Daily Potential Earnings"
            value={`${settings.dailyRewardAmount.toLocaleString()} coins`}
          />
        </div>
      </div>
    </div>
  );
}

function Preview({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-pv-elevated2 px-4 py-3">
      <span className="text-xs text-pv-textSecondary">
        {label}
      </span>

      <strong className="text-sm text-pv-text">
        {value}
      </strong>
    </div>
  );
          }
