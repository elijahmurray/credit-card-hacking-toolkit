"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signup" | "login";

interface AuthFormProps {
  mode: AuthMode;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading"; provider: "email" | "google" | "github" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function AuthForm({ mode }: AuthFormProps) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isSignup = mode === "signup";
  const heading = isSignup ? "Create your account" : "Welcome back";
  const subheading = isSignup
    ? "Free to start. 10 Sonnet messages a day, then unlimited Haiku."
    : "Log in to keep churning.";

  const callbackUrl =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function handleEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus({ kind: "loading", provider: "email" });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });
    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }
    setStatus({ kind: "sent" });
  }

  async function handleOAuth(provider: "google" | "github") {
    setStatus({ kind: "loading", provider });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });
    if (error) {
      setStatus({ kind: "error", message: error.message });
    }
    // On success the browser is redirected by Supabase; no further action.
  }

  const isLoading = status.kind === "loading";
  const emailLoading = status.kind === "loading" && status.provider === "email";
  const googleLoading = status.kind === "loading" && status.provider === "google";
  const githubLoading = status.kind === "loading" && status.provider === "github";

  if (status.kind === "sent") {
    return (
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">Check your inbox</h2>
        <p className="mt-2 text-sm text-zinc-600">
          We sent a magic link to <span className="font-medium text-zinc-900">{email}</span>.
          Click it to finish {isSignup ? "signing up" : "logging in"}.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 text-xs text-zinc-500 hover:text-zinc-900"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-zinc-900">{heading}</h2>
        <p className="mt-1 text-sm text-zinc-600">{subheading}</p>
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-60"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {emailLoading ? "Sending link..." : "Email me a magic link"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        <span>or</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={isLoading}
          className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("github")}
          disabled={isLoading}
          className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {githubLoading ? "Redirecting..." : "Continue with GitHub"}
        </button>
      </div>

      {status.kind === "error" && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {status.message}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-zinc-500">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <a href="/login" className="font-medium text-zinc-900 hover:underline">
              Log in
            </a>
          </>
        ) : (
          <>
            New here?{" "}
            <a href="/signup" className="font-medium text-zinc-900 hover:underline">
              Create an account
            </a>
          </>
        )}
      </p>
    </div>
  );
}
