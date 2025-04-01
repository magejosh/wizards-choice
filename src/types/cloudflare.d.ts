declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
}

interface D1PreparedStatement {
  bind: (...values: any[]) => D1PreparedStatement;
  all: () => Promise<{ results: any[] }>;
  run: () => Promise<void>;
}

export {}; 