
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { CrownIcon } from '../components/icons/CrownIcon';
import { SupabaseIcon } from '../components/icons/SupabaseIcon';
import { ErrorMessage } from '../components/ErrorMessage';
import { MailIcon } from '../components/icons/MailIcon';


export const AuthPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = params.get('error_description');
        
        if (errorDescription) {
          let friendlyMessage = errorDescription.replace(/\+/g, ' ');
          
          if (params.get('error_code') === 'otp_expired') {
            friendlyMessage = "Your verification link has expired. Please try signing up again to receive a new link, or sign in if you've already verified your account.";
          }
          
          setAuthError(friendlyMessage);
          
          window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }
      }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setShowVerificationMessage(false);

        if (isSignUp && password !== confirmPassword) {
            setAuthError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) {
                    setAuthError(error.message);
                } else if (data.user) {
                    // This handles both new signups and re-signups for unconfirmed users.
                    // Supabase automatically sends/resends the verification email.
                    setShowVerificationMessage(true);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    setAuthError(error.message);
                }
                // onAuthStateChange in App.tsx will handle redirect
            }
        } catch (err) {
            setAuthError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const AuthForm = () => (
       <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {authError && <ErrorMessage message={authError} />}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                    <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                {isSignUp && (
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300">Confirm Password</label>
                        <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                )}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300">
                    {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
            </form>
            <div className="text-center mt-6">
                <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }} className="text-sm text-indigo-400 hover:text-indigo-300">
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>
             <div className="flex items-center justify-center mt-6 space-x-2 text-xs text-gray-500">
               <SupabaseIcon className="w-4 h-4" />
               <span>Secure authentication by Supabase</span>
            </div>
        </div>
    );
    
    const VerificationMessage = () => (
        <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 w-full max-w-md mx-auto text-center">
            <MailIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-4 text-white">Check your email</h2>
            <p className="text-gray-300">
                We've sent a verification link to <span className="font-medium text-white">{email}</span>. Please click the link to complete your registration.
            </p>
             <button onClick={() => { setShowVerificationMessage(false); setEmail(''); setPassword(''); setConfirmPassword(''); }} className="mt-6 text-sm text-indigo-400 hover:text-indigo-300">
                Back to Sign In
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <SparklesIcon className="w-10 h-10 text-indigo-400" />
                      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        DreamForge
                      </h1>
                    </div>
                    <p className="text-lg text-gray-400">Welcome! Sign in or create an account to start creating.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left Side: Auth Form / Verification Message */}
                    {showVerificationMessage ? <VerificationMessage /> : <AuthForm />}

                    {/* Right Side: Plans & Credits */}
                    <div className="space-y-6">
                         <h3 className="text-2xl font-bold text-center text-white md:text-left">Plans & Credits</h3>
                         {/* Free Plan */}
                         <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex items-center space-x-4">
                            <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full">
                                <LockIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-white">Free Plan</h4>
                                <p className="text-gray-400"><span className="font-semibold text-white">10,000 free credits</span> on sign-up</p>
                            </div>
                         </div>
                         {/* Pro Plan */}
                         <div className="relative bg-gray-800 p-6 rounded-lg border border-indigo-500/50 ring-1 ring-indigo-500/50">
                            <div className="absolute top-0 right-0 -mt-3 mr-3">
                               <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-500 text-white">
                                 PRO
                               </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 bg-indigo-500/20 p-3 rounded-full">
                                    <CrownIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">Pro Plan</h4>
                                    <p className="text-gray-300">Unlimited generations for <span className="font-bold text-white">Rs 199 lifetime</span></p>
                                </div>
                            </div>
                            <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                                Go Pro
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
