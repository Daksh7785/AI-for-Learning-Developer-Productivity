import { Link } from 'react-router-dom';
import { Brain, Code2, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">CodeMentor.ai</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white transition">
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Understand Code.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Learn Faster.
            </span>
            <br />
            Build Better.
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Your AI-powered intelligent codebase guide that understands your repository, 
            explains architecture, and creates personalized learning paths.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border border-slate-600 rounded-xl text-lg font-semibold hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <Code2 className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Codebase Understanding</h3>
            <p className="text-slate-400">
              AI analyzes your entire repository to understand architecture, dependencies, and patterns.
            </p>
          </div>
          
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <Brain className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Mentor</h3>
            <p className="text-slate-400">
              Get contextual explanations, code reviews, and guidance tailored to your project.
            </p>
          </div>
          
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <Zap className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Adaptive Learning</h3>
            <p className="text-slate-400">
              Personalized learning paths that adapt to your knowledge gaps and learning style.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
