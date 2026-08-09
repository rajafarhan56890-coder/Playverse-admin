import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { createGame, updateGame, type GameFormInput } from "../../services/games.service";
import type { Game } from "../../types/models";

const EMPTY_FORM: GameFormInput = {
  name: "",
  description: "",
  imageURL: "",
  gameURL: "",
  deepLinkURL: "",
  category: "",
  reward: 0,
  status: "active",
  isFeatured: false,
};

export default function GameFormPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const isEditing = !!gameId && gameId !== "new";

  const [form, setForm] = useState<GameFormInput>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !gameId) return;
    let cancelled = false;
    getDoc(doc(db, "games", gameId)).then((snap) => {
      if (cancelled || !snap.exists()) return;
      const game = snap.data() as Game;
      setForm({
        name: game.name,
        description: game.description,
        imageURL: game.imageURL || "",
        gameURL: game.gameURL,
        deepLinkURL: game.deepLinkURL ?? "",
        category: game.category,
        reward: game.reward,
        status: game.status,
        isFeatured: game.isFeatured,
      });
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isEditing, gameId]);

  function validate(): string | null {
    if (!form.name.trim()) return "Game name is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.gameURL.trim()) return "Game URL is required.";
    if (!form.category.trim()) return "Category is required.";
    if (!form.reward || form.reward <= 0) return "Reward must be a positive number.";
    if (!form.imageURL.trim()) return "Image URL is required.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    const result =
      isEditing && gameId
        ? await updateGame(gameId, form)
        : await createGame(form);
    setIsSaving(false);

    if (result.success) {
      navigate("/dashboard/games");
    } else {
      setError(result.error ?? "Could not save game.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate("/dashboard/games")} className="text-pv-primary text-sm mb-4">
        ← Back to games
      </button>
      <h1 className="text-2xl font-display font-semibold text-pv-text mb-6">
        {isEditing ? "Edit game" : "Add game"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-pv-elevated border border-pv-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-pv-textSecondary mb-1">Game image</label>
          <div className="flex items-center gap-4">
            {form.imageURL ? (
              <img src={form.imageURL} alt="" className="w-20 h-20 rounded-lg object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-pv-elevated2" />
            )}
            <div className="flex-1">
              <input
                type="text"
                value={form.imageURL}
                onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                placeholder="https://example.com/image.png"
                className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
              />
              <p className="text-xs text-pv-textMuted mt-1">Paste a direct image URL</p>
            </div>
          </div>
        </div>

        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <TextAreaField
          label="Description"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />
        <Field label="Game URL" value={form.gameURL} onChange={(v) => setForm({ ...form, gameURL: v })} />
        <Field
          label="Deep link URL (optional)"
          value={form.deepLinkURL}
          onChange={(v) => setForm({ ...form, deepLinkURL: v })}
        />
        <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />

        <div>
          <label className="block text-xs text-pv-textSecondary mb-1">Reward (coins)</label>
          <input
            type="number"
            value={form.reward}
            onChange={(e) => setForm({ ...form, reward: Number(e.target.value) })}
            className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-pv-text">
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(e) => setForm({ ...form, status: e.target.checked ? "active" : "inactive" })}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-pv-text">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-pv-primary text-pv-bg font-medium py-2.5 hover:bg-pv-primaryPressed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create game"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-pv-textSecondary mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-pv-textSecondary mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg bg-pv-elevated2 border border-pv-border px-3 py-2 text-sm text-pv-text focus:outline-none focus:ring-2 focus:ring-pv-primary"
      />
    </div>
  );
}
