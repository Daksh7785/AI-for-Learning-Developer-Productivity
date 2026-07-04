import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Circle, RefreshCw, Zap, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { learningService, type LearningModule } from '../services/learningService';
import { repositoryService } from '../services/repositoryService';
import { useNotification } from '../contexts/NotificationContext';
import type { Repository } from '../types';

export default function LearningPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const { success, error: notifyError } = useNotification();

  useEffect(() => {
    repositoryService.getAll().then((data) => {
      const ready = data.filter((r) => r.status === 'ready');
      setRepos(ready);
      if (ready.length > 0) setSelectedRepoId(ready[0].id);
    }).finally(() => setLoadingRepos(false));
  }, []);

  useEffect(() => {
    if (!selectedRepoId) return;
    loadProgress();
  }, [selectedRepoId]);

  const loadProgress = async () => {
    try {
      const { progress } = await learningService.getProgress(selectedRepoId);
      const doneSet = new Set(progress.filter((p) => p.completed).map((p) => p.module));
      setCompletedModules(doneSet);
      if (modules.length > 0) {
        const pct = Math.round((doneSet.size / modules.length) * 100);
        setOverallProgress(pct);
      }
    } catch {
      // Progress may be empty — that's OK
    }
  };

  const handleGeneratePath = async () => {
    if (!selectedRepoId) return;
    setGenerating(true);
    try {
      const generatedModules = await learningService.generateLearningPath(selectedRepoId);
      setModules(generatedModules);
      success('Learning path generated!', `${generatedModules.length} modules created for your repository.`);
      setExpandedModule(generatedModules[0]?.id || null);
    } catch (err: any) {
      notifyError('Failed to generate learning path', err?.response?.data?.message || 'Check your AI API configuration.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleModuleComplete = async (moduleId: string) => {
    if (!selectedRepoId) return;
    const wasComplete = completedModules.has(moduleId);
    const newSet = new Set(completedModules);
    if (wasComplete) newSet.delete(moduleId);
    else newSet.add(moduleId);
    setCompletedModules(newSet);
    const pct = modules.length > 0 ? Math.round((newSet.size / modules.length) * 100) : 0;
    setOverallProgress(pct);

    try {
      await learningService.updateProgress(selectedRepoId, moduleId, { completed: !wasComplete });
    } catch {
      // Revert on error
      setCompletedModules(completedModules);
      setOverallProgress(modules.length > 0 ? Math.round((completedModules.size / modules.length) * 100) : 0);
    }
  };

  const selectedRepo = repos.find((r) => r.id === selectedRepoId);

  return (
    <Layout title="Learning Path">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Learning Path</h2>
          <p className="text-slate-400 text-sm">AI-generated learning modules tailored to your codebase.</p>
        </div>

        {/* Repository selector */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Select Repository</label>
          {loadingRepos ? (
            <div className="h-10 bg-slate-700 rounded-xl animate-pulse" />
          ) : repos.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm">No analyzed repositories found.</p>
              <a href="/repositories" className="text-blue-400 text-sm hover:underline mt-1 inline-block">
                Add and analyze a repository first →
              </a>
            </div>
          ) : (
            <div className="flex gap-3">
              <select
                value={selectedRepoId}
                onChange={(e) => {
                  setSelectedRepoId(e.target.value);
                  setModules([]);
                  setCompletedModules(new Set());
                  setOverallProgress(0);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleGeneratePath}
                disabled={!selectedRepoId || generating}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex-shrink-0 shadow-lg shadow-blue-500/20"
              >
                {generating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Generate Path</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {modules.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{selectedRepo?.name}</p>
                <p className="text-xs text-slate-400">{completedModules.size} of {modules.length} modules completed</p>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Empty state */}
        {modules.length === 0 && !generating && repos.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No learning path yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              Click "Generate Path" to create an AI-powered learning plan for <strong>{selectedRepo?.name}</strong>.
            </p>
            <button
              onClick={handleGeneratePath}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Generate Learning Path
            </button>
          </div>
        )}

        {/* Module list */}
        {modules.length > 0 && (
          <div className="space-y-3">
            {modules.sort((a, b) => a.order - b.order).map((module, index) => {
              const done = completedModules.has(module.id);
              const expanded = expandedModule === module.id;

              return (
                <div
                  key={module.id}
                  className={`bg-slate-800/50 border rounded-2xl overflow-hidden transition-all ${
                    done ? 'border-emerald-500/30' : 'border-slate-700'
                  }`}
                >
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-800/50 transition"
                    onClick={() => setExpandedModule(expanded ? null : module.id)}
                  >
                    {/* Step indicator */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                      done
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-700 border border-slate-600 text-slate-400'
                    }`}>
                      {done ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="text-slate-300">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${done ? 'text-emerald-400' : 'text-white'}`}>{module.title}</h3>
                        {done && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {module.estimatedTime}
                        </span>
                        <span>Module {module.order}</span>
                      </div>
                    </div>

                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {expanded && (
                    <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                      <p className="text-sm text-slate-300 mb-4">{module.description}</p>
                      {module.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {module.topics.map((topic) => (
                            <span
                              key={topic}
                              className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => toggleModuleComplete(module.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                          done
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        }`}
                      >
                        {done ? (
                          <><Circle className="w-4 h-4" /> Mark as Incomplete</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Mark as Complete</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
