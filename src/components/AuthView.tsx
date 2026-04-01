import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Train, LogIn, Mail, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthView = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(206,14,45,0.05),transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-card border border-brand-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-50" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/20 mb-4">
            <Train className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hitachi Rail</h1>
          <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-[0.2em]">Secure Access Gateway</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 bg-brand-error/10 border border-brand-error/20 rounded-xl flex items-center gap-3 text-brand-error text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@hitachirail.com"
                className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest ml-1">System Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-brand-bg/50 border border-brand-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-brand-accent text-white rounded-xl font-bold shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                {isSignUp ? 'Initialize Account' : 'Authenticate Console'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border/30 text-center">
          <p className="text-xs text-brand-text-muted mb-2">
            {isSignUp ? 'Already authorized?' : 'New system operator?'}
          </p>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-accent text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer"
          >
            {isSignUp ? 'Switch to Login' : 'Register Credentials'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
