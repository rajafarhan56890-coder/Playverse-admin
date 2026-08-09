import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface AppSettings {
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

export const DEFAULT_SETTINGS: AppSettings = {
  coinToCurrencyRate: 0.5,
  minWithdrawalAmount: 100,
  maxWithdrawalAmount: 500000,
  dailyRewardAmount: 10,
  referralBonusReferrer: 100,
  referralBonusReferred: 100,
  referralTier2Bonus: 50,
  gameRewardMultiplier: 1,
  processingFeePercent: 2.5,
  maxDailyWithdrawals: 5,
};

const SETTINGS_REF = doc(db, "settings", "general");

export async function fetchAppSettings(): Promise<AppSettings> {
  const snap = await getDoc(SETTINGS_REF);

  if (!snap.exists()) {
    await setDoc(SETTINGS_REF, {
      ...DEFAULT_SETTINGS,
      updatedAt: serverTimestamp(),
    });

    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...(snap.data() as Partial<AppSettings>),
  };
}

export async function saveAppSettings(
  settings: AppSettings
): Promise<void> {
  await setDoc(
    SETTINGS_REF,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}
