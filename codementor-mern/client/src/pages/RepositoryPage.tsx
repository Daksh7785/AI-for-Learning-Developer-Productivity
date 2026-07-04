import { useEffect, useState } from 'react';
import { Code2, Upload, Trash2, Brain, RefreshCw, Plus, ExternalLink, Search, GitBranch } from 'lucide-react';
import Layout from '../components/Layout';
import { repositoryService } from '../services/repositoryService';
import { useNotification } from '../contexts/NotificationContext';
import type { Repository } from '../types';

export default function RepositoryPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', url: '', description: '', language: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const { success, error: notifyError } = useNotification();

  const load = async () => {
    try {
      const data = await repositoryService.getAll();
      setRepositories(data);
    } catch {
      notifyError('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setSubmitting(true);
    try {
      const repo = await repositoryService.create(form);
      setRepositories((prev) => [repo, ...prev]);
      setForm({ name: '', url: '', description: '', language: '' });
      setShowAdd(false);
      success('Repository added', `"${repo.name}" is being analyzed.`);
    } catch (err: any) {
      notifyError('Failed to add repository', err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (repo: Repository) => {
    if (!confirm(`Delete "${repo.name}"? This cannot be undone.`)) return;
    setDeletingId(repo.id);
    try {
      await repositoryService.delete(repo.id);
      setRepositories((prev) => prev.filter((r) => r.id !== repo.id));
      success('Repository deleted', `"${repo.name}" has been removed.`);
    } catch {
      notifyError('Failed to delete repository');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async (repo: Repository) => {
    setAnalyzingId(repo.id);
    try {
      const updated = await repositoryService.analyze(repo.id);
      setRepositories((prev) => prev.map((r) => (r.id === repo.id ? updated : r)));
      success('Analysis started', `"${repo.name}" is being analyzed.`);
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const fresh = await repositoryService.getById(repo.id);
          setRepositories((prev) => prev.map((r) => (r.id === repo.id ? fresh : r)));
          if (fresh.status !== 'analyzing') {
            clearInterval(poll);
            setAnalyzingId(null);
            if (fresh.status === 'ready') success('Analysis complete', `"${fresh.name}" is ready.`);
            else notifyError('Analysis failed', `"${fresh.name}" encountered an error.`);
          }
        } catch { clearInterval(poll); setAnalyzingId(null); }
      }, 3000);
    } catch {
      notifyError('Failed to start analysis');
      setAnalyzingId(null);
    }
  };

  const filtered = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Repositories">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Repositories</h2>
          <p className="text-slate-400 text-sm mt-1">{repositories.length} connected</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </button>
      </div>

      {/* Add form modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-400" />
              Add Repository
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Repository Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Repository URL *</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://github.com/user/repo"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Language</label>
                <input
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  placeholder="TypeScript, Python, Go..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Add Repository</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      {repositories.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-800/50 border border-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-16 text-center">
          <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchTerm ? 'No matches found' : 'No repositories yet'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {searchTerm ? 'Try a different search term.' : 'Add your first repository to get AI-powered analysis.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Add Repository
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((repo) => (
            <div
              key={repo.id}
              className="group bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 flex flex-col gap-4 hover:bg-slate-800/80 transition-all hover:shadow-xl hover:shadow-slate-900/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{repo.name}</h3>
                  {repo.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{repo.description}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 border ${
                  repo.status === 'ready' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                  repo.status === 'analyzing' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse' :
                  'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  {repo.status}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    {repo.language}
                  </span>
                )}
                <span>{repo.filesCount} files</span>
                {repo.lastAnalyzed && (
                  <span>Analyzed {new Date(repo.lastAnalyzed).toLocaleDateString()}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleAnalyze(repo)}
                  disabled={analyzingId === repo.id || repo.status === 'analyzing'}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-xs font-medium transition"
                >
                  {analyzingId === repo.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  {analyzingId === repo.id ? 'Analyzing...' : 'Analyze'}
                </button>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  title="Open repository"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <button
                  onClick={() => handleDelete(repo)}
                  disabled={deletingId === repo.id}
                  className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/30 rounded-lg transition disabled:opacity-50"
                  title="Delete repository"
                >
                  {deletingId === repo.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
