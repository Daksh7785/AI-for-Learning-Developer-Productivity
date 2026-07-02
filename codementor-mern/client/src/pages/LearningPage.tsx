import { BookOpen, CheckCircle, Circle } from 'lucide-react';

export default function LearningPage() {
  const modules = [
    { id: 1, title: 'Introduction to Codebase', completed: true, progress: 100 },
    { id: 2, title: 'Architecture Overview', completed: true, progress: 100 },
    { id: 3, title: 'Key Components', completed: false, progress: 45 },
    { id: 4, title: 'Data Flow', completed: false, progress: 0 },
    { id: 5, title: 'Best Practices', completed: false, progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">CodeMentor.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Learning Path</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Learning Path</h1>
          <p className="text-slate-400 mb-8">Master your codebase step by step</p>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Overall Progress</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all" style={{ width: '45%' }} />
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {module.completed ? (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <Circle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                      <span>Module {index + 1}</span>
                      <span>•</span>
                      <span>{module.progress}% complete</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          module.completed ? 'bg-green-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
