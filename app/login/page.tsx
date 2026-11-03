"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    router.replace(redirect);
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirect);
    } else {
      setError(res.error || "Invalid email or password.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="glass rounded-[2rem] p-8 md:p-10">
        <div className="text-center space-y-2 mb-8">
          <p className="font-display text-4xl text-fg">Welcome back</p>
          <p className="text-sm text-muted">Log in to view your bookings and manage reservations.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-xs text-muted">
            Email address
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                className="field pl-9"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="block space-y-1.5 text-xs text-muted">
            Password
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                className="field pl-9"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full justify-center py-3 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted">
          Don't have an account?{" "}
          <Link
            href={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent underline-offset-4 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

