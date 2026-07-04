import { useEffect, useState } from 'react';
import { Code2, MessageSquare, BookOpen, Calendar, Star, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { repositoryService } from '../services/repositoryService';
import { aiService } from '../services/aiService';
import { learningService } from '../services/learningService';
import type { Repository } from '../types';

interface Stats {
  repoCount: number;
  readyRepos: number;
  chatCount: number;
  learningProgress: number;
  memberSince: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    repoCount: 0,
    readyRepos: 0,
    chatCount: 0,
    learningProgress: 0,
    memberSince: '',
  });
  const [recentRepos, setRecentRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [repos, chats, progress] = await Promise.allSettled([
          repositoryService.getAll(),
          aiService.getChats(),
          learningService.getProgress(),
        ]);

        const repoList = repos.status === 'fulfilled' ? repos.value : [];
        const chatList = chats.status === 'fulfilled' ? chats.value : [];
        const progressData = progress.status === 'fulfilled' ? progress.value : { overallProgress: 0 };

        setStats({
          repoCount: repoList.length,
          readyRepos: repoList.filter((r) => r.status === 'ready').length,
          chatCount: chatList.length,
          learningProgress: progressData.overallProgress,
          memberSince: user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Unknown',
        });

        setRecentRepos(repoList.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const statCards = [
    { label: 'Repositories', value: stats.repoCount, icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'AI Sessions', value: stats.chatCount, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Learning Progress', value: `${stats.learningProgress}%`, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Repos Analyzed', value: stats.readyRepos, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <Layout title="Profile">
      <div className="max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-2xl shadow-blue-500/30">
            {initials}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-slate-400 mb-3">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>Member since {stats.memberSince}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              user?.role === 'admin'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Developer'}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {loading ? (
                <div className="h-7 w-12 bg-slate-700 rounded animate-pulse mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-white">{value}</p>
              )}
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Repositories */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white">Recent Repositories</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-700/50 rounded-xl animate-pulse" />)}
            </div>
          ) : recentRepos.length === 0 ? (
            <div className="text-center py-8">
              <Code2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No repositories yet.</p>
              <a href="/repositories" className="text-blue-400 text-sm hover:underline">Add your first repository →</a>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRepos.map((repo) => (
                <div key={repo.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{repo.name}</p>
                    <p className="text-xs text-slate-400">{repo.language} • {repo.filesCount} files</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${
                    repo.status === 'ready' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    repo.status === 'analyzing' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-red-500/15 text-red-400 border-red-500/30'
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
