import { useAuth } from '../contexts/AuthContext';
import { Brain, Code2, BookOpen, Network, Settings, LogOut, Upload } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">CodeMentor.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <Upload className="w-4 h-4" />
                  Upload Repository
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <Brain className="w-4 h-4" />
                  Start AI Chat
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <BookOpen className="w-4 h-4" />
                  View Learning Path
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">Navigation</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <Code2 className="w-4 h-4" />
                  Repositories
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <Network className="w-4 h-4" />
                  Architecture
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-left">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
              <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
              <p className="text-slate-400 mb-6">
                Welcome to your AI-powered learning dashboard. Upload a repository to get started.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-8 h-8 text-blue-400" />
                    <h3 className="font-semibold">Repositories</h3>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-slate-400">Connected</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-8 h-8 text-purple-400" />
                    <h3 className="font-semibold">AI Sessions</h3>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-slate-400">Total</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-8 h-8 text-green-400" />
                    <h3 className="font-semibold">Learning Progress</h3>
                  </div>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <p className="text-slate-400">No recent activity. Start by uploading a repository.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
