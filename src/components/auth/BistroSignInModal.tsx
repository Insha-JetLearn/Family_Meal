import React, { useState } from 'react';
import { Sparkles, Mail, Lock, X, ArrowRight } from 'lucide-react';

interface BistroSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (email?: string) => void;
  onOpenOnboarding: () => void;
}

export const BistroSignInModal: React.FC<BistroSignInModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
  onOpenOnboarding,
}) => {
  const [email, setEmail] = useState('rossi.kitchen@example.com');
  const [password, setPassword] = useState('••••••••');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignInSuccess(email);
    onClose();
  };

  const handleContinueAsGuest = () => {
    onSignInSuccess('guest@bistrochef.ai');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#131722]/95 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#202538] border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/10">
            <div className="text-amber-400">
              <Sparkles className="w-8 h-8 stroke-[1.8]" />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-3xl font-extrabold tracking-tight">
            <span className="font-display text-white">BistroChef</span>
            <span className="font-display bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent">
              AI
            </span>
          </div>

          <p className="text-xs text-stone-400 mt-2 max-w-xs font-serif leading-relaxed">
            European-inspired family meal planning & vibrant fresh recipe curation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                PASSWORD
              </label>
              <button
                type="button"
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1b2030] border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400/50 transition-colors"
              />
            </div>
          </div>

          {/* Radiant Sign In Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl gradient-bistro-btn text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 uppercase tracking-wider mt-2 cursor-pointer"
          >
            <span>{isSignUp ? 'CREATE ACCOUNT →' : 'SIGN IN →'}</span>
          </button>
        </form>

        {/* Social Connect */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              OR CONNECT WITH
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="w-full py-3 rounded-xl bg-[#1b2030] hover:bg-[#23293d] border border-white/10 text-stone-200 text-xs font-semibold flex items-center justify-center space-x-2.5 transition-colors cursor-pointer"
          >
            {/* Colorful Google G */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="pt-2 text-xs text-stone-400 flex items-center justify-center space-x-1">
            <span>{isSignUp ? 'Already have an account?' : 'New to BistroChef?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                onOpenOnboarding();
                onClose();
              }}
              className="text-emerald-400 font-bold hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="text-[11px] font-bold text-stone-500 hover:text-stone-300 uppercase tracking-widest transition-colors block w-full text-center"
          >
            CONTINUE AS GUEST
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-[10px] text-stone-500 leading-relaxed max-w-xs mx-auto border-t border-white/5 pt-4">
          BistroChef AI provides meal-planning suggestions for informational purposes only and is not a substitute for professional medical, nutritional, or dietary advice.
        </p>
      </div>
    </div>
  );
};
