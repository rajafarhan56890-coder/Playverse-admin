import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllGames,
  deleteGame,
  toggleGameStatus,
} from "../../services/games.service";
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
      const data = await fetchAllGames();
      setGames(data);
    } catch (err) {
      console.error("Failed to load games:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load games."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(game: Game) {
    if (busyId) return;

    setBusyId(game.id);

    try {
      const result = await toggleGameStatus(
        game.id,
        game.status
      );

      if (result.success) {
        setGames((prev) =>
          prev.map((g) =>
            g.id === game.id
              ? {
                  ...g,
                  status:
                    g.status === "active"
                      ? "inactive"
                      : "active",
                }
              : g
          )
        );
      } else {
        alert(result.error ?? "Could not update game status.");
      }
    } catch (err) {
      console.error("Toggle game status error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Could not update game status."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(game: Game) {
    if (
      !window.confirm(
        `Delete "${game.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    if (busyId) return;

    setBusyId(game.id);

    try {
      const result = await deleteGame(game.id);

      if (result.success) {
        setGames((prev) =>
          prev.filter((g) => g.id !== game.id)
        );
      } else {
        alert(result.error ?? "Could not delete game.");
      }
    } catch (err) {
      console.error("Delete game error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Could not delete game."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-pv-text">
            Games
          </h1>
          <p className="text-sm text-pv-textSecondary mt-1">
            Manage games available on PlayVerse.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/games/new")}
          className="rounded-full bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium hover:bg-pv-primaryPressed"
        >
          + Add game
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>

          <button
            onClick={load}
            className="text-red-300 text-xs mt-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-pv-elevated border border-pv-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-pv-textSecondary border-b border-pv-border">
                  <th className="px-4 py-3 font-medium">
                    Game
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Category
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Levels
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Plays
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Featured
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {games.map((game) => {
                  const isBusy = busyId === game.id;

                  return (
                    <tr
                      key={game.id}
                      className="border-b border-pv-border last:border-0"
                    >
                      {/* Game */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {game.imageURL ? (
                            <img
                              src={game.imageURL}
                              alt={game.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-pv-elevated2 flex items-center justify-center">
                              🎮
                            </div>
                          )}

                          <div>
                            <p className="text-pv-text font-medium">
                              {game.name}
                            </p>

                            <p className="text-xs text-pv-textMuted">
                              {game.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-pv-textSecondary">
                        {game.category || "—"}
                      </td>

                      {/* Levels */}
                      <td className="px-4 py-3 text-pv-coin font-mono">
                        {Number(game.totalLevels || 0).toLocaleString()} ×{" "}
                        {Number(game.coinsPerLevel || 0).toLocaleString()}
                      </td>

                      {/* Plays */}
                      <td className="px-4 py-3 text-pv-textSecondary">
                        {Number(
                          game.playCount || 0
                        ).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleToggleStatus(game)
                          }
                          disabled={isBusy}
                          className={`text-xs px-2 py-1 rounded-full disabled:opacity-60 ${
                            game.status === "active"
                              ? "bg-pv-success/20 text-pv-success"
                              : "bg-pv-elevated2 text-pv-textMuted"
                          }`}
                        >
                          {isBusy
                            ? "Updating..."
                            : game.status}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-pv-textSecondary">
                        {game.isFeatured ? (
                          <span className="text-pv-coin">
                            ★ Featured
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/games/${game.id}/edit`
                            )
                          }
                          disabled={isBusy}
                          className="text-pv-primary text-xs hover:underline disabled:opacity-50 mr-4"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(game)
                          }
                          disabled={isBusy}
                          className="text-red-400 text-xs hover:underline disabled:opacity-50"
                        >
                          {isBusy ? "Please wait..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty state */}
                {games.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center"
                    >
                      <div className="text-4xl mb-3">
                        🎮
                      </div>

                      <p className="text-pv-text font-medium">
                        No games yet
                      </p>

                      <p className="text-pv-textSecondary text-sm mt-1">
                        Add your first game to get started.
                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            "/dashboard/games/new"
                          )
                        }
                        className="mt-4 rounded-full bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium"
                      >
                        + Add game
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
