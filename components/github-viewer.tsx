"use client";

import { useState } from "react";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  private: boolean;
}

export default function GithubViewer({ email }: { email: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  async function handleFetch() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/maton/gateway/github?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRepos(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!fetched && (
        <button
          onClick={handleFetch}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-accent text-surface font-semibold text-[12px] py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
        >
          {loading ? "Fetching..." : "List Repositories"}
        </button>
      )}
      {error && <p className="text-danger text-[13px] mt-2">{error}</p>}
      {fetched && repos.length === 0 && <p className="text-text-muted text-[13px]">No repositories found.</p>}
      {repos.length > 0 && (
        <div className="space-y-2">
          {repos.map((repo) => (
            <div key={repo.id} className="p-3 bg-surface border border-border-subtle rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[13px] font-medium text-text-primary">{repo.name}</p>
                {repo.private && (
                  <span className="text-[9px] font-medium text-text-muted bg-surface-hover px-1.5 py-0.5 rounded">Private</span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="text-[11px] text-warning">★ {repo.stargazers_count}</span>
                )}
              </div>
              {repo.description && (
                <p className="text-[12px] text-text-secondary line-clamp-1">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                {repo.language && <span className="text-[10px] text-text-muted">{repo.language}</span>}
                <span className="text-[10px] text-text-muted font-mono">{repo.full_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
