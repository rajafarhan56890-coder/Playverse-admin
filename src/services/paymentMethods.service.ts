import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  minPayout: number;
  maxPayout: number;
  fee: number;
  updatedAt?: unknown;
}

const DEFAULT_METHODS: PaymentMethod[] = [
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
    fee: 1,
  },
];

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const snap = await getDocs(collection(db, "paymentMethods"));

  if (snap.empty) {
    await Promise.all(
      DEFAULT_METHODS.map((method) =>
        setDoc(doc(db, "paymentMethods", method.id), {
          ...method,
          updatedAt: serverTimestamp(),
        })
      )
    );

    return DEFAULT_METHODS;
  }

  return snap.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<PaymentMethod, "id">),
  }));
}

export async function updatePaymentMethod(
  id: string,
  data: Partial<Omit<PaymentMethod, "id">>
): Promise<void> {
  await updateDoc(doc(db, "paymentMethods", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
