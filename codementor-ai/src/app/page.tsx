'use client';

import { useState } from 'react';
import { Brain, Code2, BookOpen, Network, Zap, Upload } from 'lucide-react';
import ChatInterface from '@/components/chat-interface';
import ArchitectureViz from '@/components/architecture-viz';
import { ASTParser, ParsedCodebase } from '@/lib/ast-parser';
import { KnowledgeGraphBuilder, KnowledgeGraph } from '@/lib/knowledge-graph';
import { AdaptiveLearningPathGenerator, LearningPath } from '@/lib/learning-path';
import { LearningStyleDetector, LearningStyleProfile } from '@/lib/learning-style';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'architecture' | 'learning'>('chat');
  const [codebaseLoaded, setCodebaseLoaded] = useState(false);
  const [parsedCodebase, setParsedCodebase] = useState<ParsedCodebase | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const astParser = new ASTParser();
  const graphBuilder = new KnowledgeGraphBuilder();
  const learningPathGenerator = new AdaptiveLearningPathGenerator();
  const learningStyleDetector = new LearningStyleDetector();

  const handleCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    astParser.reset();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      astParser.parseFile(content, file.name);
    }

    const codebase = astParser.getParsedCodebase();
    setParsedCodebase(codebase);

    const graph = graphBuilder.buildFromCodebase(codebase);
    setKnowledgeGraph(graph);

    const path = learningPathGenerator.generatePathFromCodebase(codebase);
    setLearningPath(path);

    const styleProfile = learningStyleDetector.getProfile();
    setLearningStyle(styleProfile);

    setCodebaseLoaded(true);
    setIsLoading(false);
  };

  const handleChatMessage = async (message: string): Promise<string> => {
    learningStyleDetector.recordInteraction({
      timestamp: new Date(),
      type: 'question',
      content: message,
      responseLength: 0,
    });

    if (message.toLowerCase().includes('architecture')) {
      return `Based on the codebase analysis, this project has ${parsedCodebase?.nodes.length || 0} code nodes and ${knowledgeGraph?.edges.length || 0} relationships. The architecture follows a modular pattern with clear separation of concerns. Would you like me to show you the visual architecture diagram?`;
    }

    if (message.toLowerCase().includes('learn')) {
      return `I've created a personalized learning path for you with ${learningPath?.modules.length || 0} modules. Based on your interactions, I've detected your learning style as ${learningStyle?.primaryStyle || 'textual'}. Start with the first module to build a strong foundation!`;
    }

    if (message.toLowerCase().includes('explain')) {
      return `I can explain any part of this codebase! Just ask about a specific function, class, or concept. I'll provide context-aware explanations based on the actual code structure, not generic answers. What would you like to understand better?`;
    }

    return `I understand you're asking about: "${message}". Let me analyze the codebase to provide a contextual answer. This codebase has ${parsedCodebase?.files.length || 0} files with various components. Would you like me to explain a specific part or show you the architecture?`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CodeMentor.ai</h1>
                <p className="text-xs text-slate-400">Your Intelligent Codebase Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!codebaseLoaded && (
                <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Codebase</span>
                  <input
                    type="file"
                    multiple
                    accept=".js,.jsx,.ts,.tsx,.py"
                    onChange={handleCodeUpload}
                    className="hidden"
                  />
                </label>
              )}
              {codebaseLoaded && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Codebase Loaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!codebaseLoaded ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-6">
              <Code2 className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome to CodeMentor.ai</h2>
            <p className="text-slate-400 max-w-md mb-8">
              Upload your codebase to get started with AI-powered code understanding, 
              architecture visualization, and personalized learning paths.
            </p>
            <label className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all text-lg font-medium">
              <Upload className="w-5 h-5" />
              <span>Upload Your Codebase</span>
              <input
                type="file"
                multiple
                accept=".js,.jsx,.ts,.tsx,.py"
                onChange={handleCodeUpload}
                className="hidden"
              />
            </label>
            {isLoading && (
              <div className="mt-6 text-slate-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">Analyzing codebase...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="font-medium">AI Mentor</span>
              </button>
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Network className="w-4 h-4" />
                <span className="font-medium">Architecture</span>
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'learning'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Learning Path</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {activeTab === 'chat' && (
                  <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-700">
                    <ChatInterface onSendMessage={handleChatMessage} />
                  </div>
                )}
                {activeTab === 'architecture' && knowledgeGraph && (
                  <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-700">
                    <ArchitectureViz knowledgeGraph={knowledgeGraph} />
                  </div>
                )}
                {activeTab === 'learning' && learningPath && (
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-[600px] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-2">{learningPath.name}</h2>
                    <p className="text-slate-400 mb-6">{learningPath.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="font-medium">{learningPath.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${learningPath.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {learningPath.modules.map((module, index) => (
                        <div
                          key={module.id}
                          className={`p-4 rounded-xl border transition-all ${
                            module.completed
                              ? 'bg-green-600/10 border-green-600/30'
                              : 'bg-slate-700/50 border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  module.completed
                                    ? 'bg-green-600'
                                    : module.difficulty === 'beginner'
                                    ? 'bg-blue-600'
                                    : module.difficulty === 'intermediate'
                                    ? 'bg-yellow-600'
                                    : 'bg-red-600'
                                }`}
                              >
                                {module.completed ? '✓' : index + 1}
                              </div>
                              <div>
                                <h3 className="font-semibold">{module.title}</h3>
                                <p className="text-sm text-slate-400">{module.description}</p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                module.difficulty === 'beginner'
                                  ? 'bg-blue-600/20 text-blue-400'
                                  : module.difficulty === 'intermediate'
                                  ? 'bg-yellow-600/20 text-yellow-400'
                                  : 'bg-red-600/20 text-red-400'
                              }`}
                            >
                              {module.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>⏱️ {module.estimatedTime} min</span>
                            <span>📚 {module.concepts.length} concepts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    Learning Style
                  </h3>
                  {learningStyle && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Primary</span>
                        <span className="font-medium capitalize">{learningStyle.primaryStyle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Confidence</span>
                        <span className="font-medium">{learningStyle.confidenceScore}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-400" />
                    Codebase Stats
                  </h3>
                  {parsedCodebase && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Files</span>
                        <span className="font-medium">{parsedCodebase.files.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Functions</span>
                        <span className="font-medium">
                          {parsedCodebase.nodes.filter(n => n.type === 'function').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Classes</span>
                        <span className="font-medium">
                          {parsedCodebase.nodes.filter(n => n.type === 'class').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Relationships</span>
                        <span className="font-medium">{parsedCodebase.relationships.length}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-400" />
                    Learning Progress
                  </h3>
                  {learningPath && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Modules</span>
                        <span className="font-medium">{learningPath.modules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Completed</span>
                        <span className="font-medium">
                          {learningPath.modules.filter(m => m.completed).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Time</span>
                        <span className="font-medium">{learningPath.totalEstimatedTime} min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
