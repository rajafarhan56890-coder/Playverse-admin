import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllGames,
  deleteGame,
  toggleGameStatus,
} from "../../services/games.service";
import type { Game } from "../../types/models";

export default function GamesManagementPage() {
  const navigate = useNavigate();

  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadGames() {
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
          : "Could not load games from Firebase."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  async function handleToggle(game: Game) {
    if (busyId) return;

    setBusyId(game.id);
    setError(null);

    try {
      const result = await toggleGameStatus(
        game.id,
        game.status
      );

      if (!result.success) {
        throw new Error(
          result.error ?? "Could not update game status."
        );
      }

      setGames((currentGames) =>
        currentGames.map((item) =>
          item.id === game.id
            ? {
                ...item,
                status:
                  item.status === "active"
                    ? "inactive"
                    : "active",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle game status error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not update game status."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(game: Game) {
    const confirmed = window.confirm(
      `Delete "${game.name}"?\n\nThis will permanently remove this game from Firebase.`
    );

    if (!confirmed || busyId) return;

    setBusyId(game.id);
    setError(null);

    try {
      const result = await deleteGame(game.id);

      if (!result.success) {
        throw new Error(
          result.error ?? "Could not delete game."
        );
      }

      setGames((currentGames) =>
        currentGames.filter((item) => item.id !== game.id)
      );
    } catch (err) {
      console.error("Delete game error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete game."
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleEdit(game: Game) {
    navigate(`/dashboard/games/${game.id}/edit`);
  }

  function handleAddGame() {
    navigate("/dashboard/games/new");
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-pv-text">
            Games Management
          </h1>

          <p className="text-sm text-pv-textSecondary mt-1">
            Manage games stored in your Firebase games collection.
          </p>
        </div>

        <button
          onClick={handleAddGame}
          className="rounded-full bg-pv-primary text-pv-bg px-4 py-2 text-sm font-medium hover:bg-pv-primaryPressed transition"
        >
          + Add New Game
        </button>
      </div>

      {/* Firebase Info */}
      <div className="mb-5 rounded-xl border border-pv-border bg-pv-elevated px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-pv-text">
              Firebase Games Collection
            </p>

            <p className="text-xs text-pv-textMuted mt-1">
              {games.length} game{games.length !== 1 ? "s" : ""} loaded
            </p>
          </div>

          <button
            onClick={loadGames}
            disabled={isLoading}
            className="text-xs text-pv-primary hover:underline disabled:opacity-50"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-400">
                Firebase Error
              </p>

              <p className="text-xs text-red-300 mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={loadGames}
              className="text-xs text-red-300 hover:underline whitespace-nowrap"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="bg-pv-elevated border border-pv-border rounded-2xl flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-pv-primary border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm text-pv-textSecondary mt-3">
              Loading games from Firebase...
            </p>
          </div>
        </div>
      ) : games.length === 0 ? (
        /* Empty State */
        <div className="bg-pv-elevated border border-pv-border rounded-2xl px-6 py-16 text-center">
          <div className="text-5xl mb-4">🎮</div>

          <h2 className="text-lg font-semibold text-pv-text">
            No games found
          </h2>

          <p className="text-sm text-pv-textSecondary mt-2">
            There are currently no games in your Firebase games collection.
          </p>

          <button
            onClick={handleAddGame}
            className="mt-5 rounded-full bg-pv-primary text-pv-bg px-5 py-2.5 text-sm font-medium hover:bg-pv-primaryPressed"
          >
            + Add Your First Game
          </button>
        </div>
      ) : (
        /* Games */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {games.map((game) => {
            const isBusy = busyId === game.id;

            return (
              <div
                key={game.id}
                className="bg-pv-elevated border border-pv-border rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-44 bg-pv-elevated2">
                  {game.imageURL ? (
                    <img
                      src={game.imageURL}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🎮</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggle(game)}
                      disabled={isBusy}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm disabled:opacity-60 ${
                        game.status === "active"
                          ? "bg-pv-success/90 text-white"
                          : "bg-gray-700/90 text-gray-200"
                      }`}
                    >
                      {isBusy
                        ? "Updating..."
                        : game.status === "active"
                        ? "✓ Active"
                        : "Inactive"}
                    </button>
                  </div>

                  {/* Featured */}
                  {game.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="text-xs px-3 py-1.5 rounded-full bg-pv-coin text-pv-bg font-semibold">
                        ★ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-pv-text truncate">
                        {game.name}
                      </h2>

                      <p className="text-xs text-pv-textMuted mt-1 truncate">
                        ID: {game.id}
                      </p>
                    </div>

                    {game.category && (
                      <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-pv-elevated2 text-pv-textSecondary">
                        {game.category}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-pv-textSecondary mt-4 line-clamp-2 min-h-[42px]">
                    {game.description || "No description available."}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="rounded-xl bg-pv-elevated2 px-3 py-3">
                      <p className="text-xs text-pv-textMuted">
                        Levels
                      </p>

                      <p className="text-sm font-semibold text-pv-text mt-1">
                        {Number(game.totalLevels || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-pv-elevated2 px-3 py-3">
                      <p className="text-xs text-pv-textMuted">
                        Plays
                      </p>

                      <p className="text-sm font-semibold text-pv-text mt-1">
                        {Number(game.playCount || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-pv-elevated2 px-3 py-3">
                      <p className="text-xs text-pv-textMuted">
                        Coins / level
                      </p>

                      <p className="text-sm font-semibold text-pv-coin mt-1">
                        {Number(game.coinsPerLevel || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-pv-elevated2 px-3 py-3">
                      <p className="text-xs text-pv-textMuted">
                        Engine
                      </p>

                      <p className="text-sm font-semibold text-pv-text mt-1 truncate">
                        {game.engine ?? "—"}
                      </p>
                    </div>
                  </div>

                  {/* URLs */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-pv-textMuted">
                        Game URL
                      </span>

                      {game.gameURL ? (
                        <a
                          href={game.gameURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-pv-primary hover:underline truncate max-w-[180px]"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-pv-textMuted">
                          —
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-pv-textMuted">
                        Deep Link
                      </span>

                      <span className="text-xs text-pv-textSecondary truncate max-w-[180px]">
                        {game.deepLinkURL || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-5 pt-4 border-t border-pv-border">
                    <button
                      onClick={() => handleEdit(game)}
                      disabled={isBusy}
                      className="flex-1 rounded-lg bg-pv-primary/15 text-pv-primary px-3 py-2 text-sm font-medium hover:bg-pv-primary/25 disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(game)}
                      disabled={isBusy}
                      className="flex-1 rounded-lg bg-red-500/10 text-red-400 px-3 py-2 text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {isBusy ? "Please wait..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
            }
