'use client';
import { Metadata } from 'next';
import SignInForm from '@/components/auth/sign-in-form';
import SignUpForm from '@/components/auth/sign-up-form';
import { useState } from 'react';


export default function Authentication() {
    const [isSignIn, setIsSignIn] = useState(true);
    return (
        <div className="min-h-screen flex items-center justify-center from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {isSignIn ? <SignInForm /> : <SignUpForm />}

                <p className="text-center text-slate-400 text-sm mt-6">
                    {isSignIn ? (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={() => setIsSignIn(false)}
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => setIsSignIn(true)}
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}