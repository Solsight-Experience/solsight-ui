"use client";

import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";
import { useState } from "react";
import Link from "next/link";

export default function Authentication() {
    const [isSignIn, setIsSignIn] = useState(true); // mặc định Sign In

    return (
        <div className="min-h-screen flex flex-col items-center justify-center from-slate-900 via-slate-800 to-slate-900">
            {/* Back to Home */}
            <div className="absolute top-4 left-4">
                <Link href="/" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    &larr; Back to Home
                </Link>
            </div>

            <div className="w-full max-w-md">
                {isSignIn ? <SignInForm onToggle={() => setIsSignIn(false)} /> : <SignUpForm onToggle={() => setIsSignIn(true)} />}

                <p className="text-center text-slate-400 text-sm mt-6">
                    {isSignIn ? (
                        <>
                            Don&apos;t have an account?{" "}
                            <button onClick={() => setIsSignIn(false)} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => setIsSignIn(true)} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
