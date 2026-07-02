import { useState } from 'react';
import { Brain, Code2, Upload, Trash2, ExternalLink } from 'lucide-react';
import type { Repository } from '../types';

export default function RepositoryPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // TODO: Implement repository upload logic
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">CodeMentor.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Repositories</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Repositories</h1>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Repository'}</span>
            <input
              type="file"
              multiple
              accept=".zip,.tar,.gz"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {repositories.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700 text-center">
            <Code2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
            <p className="text-slate-400 mb-6">
              Upload a repository to get started with AI-powered code analysis
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div key={repo.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{repo.name}</h3>
                    <p className="text-sm text-slate-400">{repo.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    repo.status === 'ready'
                      ? 'bg-green-600/20 text-green-400'
                      : repo.status === 'analyzing'
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {repo.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{repo.language}</span>
                  <span>•</span>
                  <span>{repo.filesCount} files</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                    <Brain className="w-4 h-4" />
                    Analyze
                  </button>
                  <button className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
