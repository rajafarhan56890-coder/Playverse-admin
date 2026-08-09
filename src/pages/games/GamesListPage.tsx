import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllGames, deleteGame, toggleGameStatus } from "../../services/games.service";
import type { Game } from "../../types/models";

export default function GamesListPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      setGames(await fetchAllGames());
    } catch (err) {
      setError((err as Error).message || "Could not load games.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(game: Game) {
    setBusyId(game.id);
    const result = await toggleGameStatus(game.id, game.status);
    setBusyId(null);
    if (result.success) {
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, status: g.status === "active" ? "inactive" : "active" } : g))
      );
    } else {
      alert(result.error ?? "Could not update status.");
    }
  }

  async function handleDelete(game: Game) {
    if (!window.confirm(`Delete "${game.name}"? This cannot be undone.`)) return;
    setBusyId(game.id);
    const result = await deleteGame(game.id);
    setBusyId(null);
    if (result.success) {
      setGames((prev) => prev.filter((g) => g.id !== game.id));
    } else {
      alert(result.error ?? "Could not delete game.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-pv-text">Games</h1>
        <button
          onClick={() => navigate("/dashboard/games/new")}
          className="rounded-full bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium hover:bg-pv-primaryPressed"
        >
          + Add game
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-pv-elevated border border-pv-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-pv-textSecondary border-b border-pv-border">
                <th className="px-4 py-3 font-medium">Game</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Reward</th>
                <th className="px-4 py-3 font-medium">Plays</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="border-b border-pv-border last:border-0">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {game.imageURL ? (
                      <img src={game.imageURL} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-pv-elevated2" />
                    )}
                    <span className="text-pv-text">{game.name}</span>
                  </td>
                  <td className="px-4 py-3 text-pv-textSecondary">{game.category}</td>
                  <td className="px-4 py-3 text-pv-coin font-mono">{game.reward.toLocaleString()}</td>
                  <td className="px-4 py-3 text-pv-textSecondary">{game.playCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(game)}
                      disabled={busyId === game.id}
                      className={`text-xs px-2 py-0.5 rounded-full disabled:opacity-60 ${
                        game.status === "active"
                          ? "bg-pv-success/20 text-pv-success"
                          : "bg-pv-elevated2 text-pv-textMuted"
                      }`}
                    >
                      {game.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-pv-textSecondary">{game.isFeatured ? "★" : "—"}</td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/dashboard/games/${game.id}/edit`)}
                      className="text-pv-primary text-xs hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(game)}
                      disabled={busyId === game.id}
                      className="text-red-400 text-xs hover:underline disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-pv-textSecondary">
                    No games yet. Add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
