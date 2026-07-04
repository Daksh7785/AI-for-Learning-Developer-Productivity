import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Brain, BookOpen, Upload, MessageSquare, Clock, TrendingUp, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { repositoryService } from '../services/repositoryService';
import { aiService } from '../services/aiService';
import { learningService } from '../services/learningService';
import type { Repository } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [learningProgress, setLearningProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [repoData, chatsData, progressData] = await Promise.allSettled([
          repositoryService.getAll(),
          aiService.getChats(),
          learningService.getProgress(),
        ]);

        if (repoData.status === 'fulfilled') setRepos(repoData.value);
        if (chatsData.status === 'fulfilled') setChatCount(chatsData.value.length);
        if (progressData.status === 'fulfilled') setLearningProgress(progressData.value.overallProgress);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const readyRepos = repos.filter((r) => r.status === 'ready');
  const recentRepos = repos.slice(0, 3);

  const stats = [
    {
      label: 'Repositories',
      value: repos.length,
      sub: `${readyRepos.length} analyzed`,
      icon: Code2,
      color: 'from-blue-500 to-blue-700',
      glow: 'shadow-blue-500/20',
      action: () => navigate('/repositories'),
    },
    {
      label: 'AI Sessions',
      value: chatCount,
      sub: 'Total chats',
      icon: Brain,
      color: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/20',
      action: () => navigate('/ai-chat'),
    },
    {
      label: 'Learning Progress',
      value: `${learningProgress}%`,
      sub: 'Overall completion',
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-700',
      glow: 'shadow-emerald-500/20',
      action: () => navigate('/learning'),
    },
  ];

  const quickActions = [
    { label: 'Upload Repository', icon: Upload, to: '/repositories', color: 'text-blue-400' },
    { label: 'Start AI Chat', icon: MessageSquare, to: '/ai-chat', color: 'text-purple-400' },
    { label: 'View Learning Path', icon: BookOpen, to: '/learning', color: 'text-emerald-400' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-slate-400">Here's an overview of your CodeMentor workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, glow, action }) => (
          <button
            key={label}
            onClick={action}
            className={`group bg-slate-800/50 border border-slate-700 rounded-2xl p-5 text-left hover:border-slate-600 hover:bg-slate-800 transition-all hover:shadow-xl ${glow}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-3xl font-bold text-white">{value}</p>
            )}
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {quickActions.map(({ label, icon: Icon, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-left text-sm font-medium text-slate-300 hover:text-white transition group"
              >
                <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Repositories */}
        <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-white">Recent Repositories</h3>
            </div>
            <button onClick={() => navigate('/repositories')} className="text-xs text-blue-400 hover:text-blue-300 transition">
              View all →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-700/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentRepos.length === 0 ? (
            <div className="text-center py-10">
              <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-3">No repositories yet</p>
              <button
                onClick={() => navigate('/repositories')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm hover:opacity-90 transition"
              >
                Add Your First Repository
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRepos.map((repo) => (
                <div key={repo.id} className="flex items-center gap-3 p-3 bg-slate-700/30 hover:bg-slate-700/60 rounded-xl transition group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-600 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{repo.name}</p>
                    <p className="text-xs text-slate-400 truncate">{repo.language} • {repo.filesCount} files</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    repo.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    repo.status === 'analyzing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {repo.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
