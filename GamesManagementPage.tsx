import React, { useState } from "react";

interface Game {
  id: string;
  name: string;
  description: string;
  totalCoins: number;
  difficulty: "easy" | "medium" | "hard";
  totalLevels: number;
  active: boolean;
}

export default function GamesManagementPage() {
  const [games, setGames] = useState<Game[]>([
    {
      id: "flappy-birds",
      name: "Flappy Birds",
      description: "Navigate through pipes without crashing",
      totalCoins: 1000,
      difficulty: "easy",
      totalLevels: 100,
      active: true,
    },
    {
      id: "coin-clicker",
      name: "Coin Clicker",
      description: "Tap coins as fast as you can",
      totalCoins: 1000,
      difficulty: "medium",
      totalLevels: 100,
      active: true,
    },
    {
      id: "color-match",
      name: "Color Match",
      description: "Match colors correctly",
      totalCoins: 1000,
      difficulty: "hard",
      totalLevels: 100,
      active: true,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Game>({
    id: "",
    name: "",
    description: "",
    totalCoins: 0,
    difficulty: "easy",
    totalLevels: 100,
    active: true,
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    setFormData(game);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setFormData({
      id: `game-${Date.now()}`,
      name: "",
      description: "",
      totalCoins: 1000,
      difficulty: "easy",
      totalLevels: 100,
      active: true,
    });
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (isAddingNew) {
      setGames([...games, formData]);
      setIsAddingNew(false);
    } else {
      setGames(
        games.map((g) => (g.id === editingId ? formData : g))
      );
      setEditingId(null);
    }

    setFormData({
      id: "",
      name: "",
      description: "",
      totalCoins: 0,
      difficulty: "easy",
      totalLevels: 100,
      active: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this game?")) {
      setGames(games.filter((g) => g.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setGames(
      games.map((g) => (g.id === id ? { ...g, active: !g.active } : g))
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎮 Games Management</h1>
        <button onClick={handleAddNew} style={styles.addBtn}>
          + Add New Game
        </button>
      </div>

      {(isAddingNew || editingId) && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {isAddingNew ? "Add New Game" : "Edit Game"}
          </h2>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label>Game Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={styles.input}
                placeholder="e.g., Flappy Birds"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                style={{ ...styles.input, minHeight: "80px" }}
                placeholder="Game description..."
              />
            </div>

            <div style={styles.formGroup}>
              <label>Total Coins</label>
              <input
                type="number"
                value={formData.totalCoins}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCoins: Number(e.target.value),
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as "easy" | "medium" | "hard",
                  })
                }
                style={styles.input}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Total Levels</label>
              <input
                type="number"
                value={formData.totalLevels}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalLevels: Number(e.target.value),
                  })
                }
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formButtons}>
            <button
              onClick={handleSave}
              style={{
                ...styles.btn,
                backgroundColor: "#28a745",
              }}
            >
              Save Game
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setIsAddingNew(false);
              }}
              style={{
                ...styles.btn,
                backgroundColor: "#6c757d",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={styles.gamesGrid}>
        {games.map((game) => (
          <div key={game.id} style={styles.gameCard}>
            <div style={styles.gameHeader}>
              <div>
                <h3 style={styles.gameName}>{game.name}</h3>
                <span
                  style={{
                    ...styles.difficultyBadge,
                    backgroundColor:
                      game.difficulty === "easy"
                        ? "#d4edda"
                        : game.difficulty === "medium"
                        ? "#fff3cd"
                        : "#f8d7da",
                    color:
                      game.difficulty === "easy"
                        ? "#155724"
                        : game.difficulty === "medium"
                        ? "#856404"
                        : "#721c24",
                  }}
                >
                  {game.difficulty}
                </span>
              </div>
              <button
                onClick={() => handleToggle(game.id)}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: game.active ? "#28a745" : "#dc3545",
                }}
              >
                {game.active ? "Active" : "Inactive"}
              </button>
            </div>

            <p style={styles.description}>{game.description}</p>

            <div style={styles.gameStats}>
              <div style={styles.stat}>
                <span>Levels:</span>
                <strong>{game.totalLevels}</strong>
              </div>
              <div style={styles.stat}>
                <span>Max Coins:</span>
                <strong>{game.totalCoins.toLocaleString()}</strong>
              </div>
            </div>

            <div style={styles.gameActions}>
              <button
                onClick={() => handleEdit(game)}
                style={{
                  ...styles.smallBtn,
                  backgroundColor: "#17a2b8",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(game.id)}
                style={{
                  ...styles.smallBtn,
                  backgroundColor: "#dc3545",
                }}
              >
                Delete
              </button>
            </div>
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
  addBtn: {
    padding: "12px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#333",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
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
  formButtons: {
    display: "flex",
    gap: "10px",
  },
  btn: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  gamesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  gameCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  gameHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #dee2e6",
  },
  gameName: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
  },
  difficultyBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "3px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
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
  description: {
    margin: "0 0 15px 0",
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  gameStats: {
    display: "flex",
    gap: "20px",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px" as const,
    fontSize: "13px",
  },
  gameActions: {
    display: "flex",
    gap: "10px",
  },
  smallBtn: {
    flex: 1,
    padding: "8px 12px",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "12px",
  },
};
