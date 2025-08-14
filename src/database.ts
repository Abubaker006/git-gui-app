import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".git-gui-data.sqlite"
);

const db = new Database(dbPath);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE
  )
`
).run();

export default db;



export function addRepo(name: string, path: string) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO repos (name, path) VALUES (?, ?)"
  );
  stmt.run(name, path);
}

export function getRepos() {
  const stmt = db.prepare("SELECT * FROM repos");
  return stmt.all();
}

export function deleteRepo(id: number) {
  const stmt = db.prepare("DELETE FROM repos WHERE id = ?");
  stmt.run(id);
}