"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User as UserIcon, Calendar, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/auth-context";

const THEMES = [
  ["forest", "Forest", "#0B3D2E"],
  ["ivory", "Ivory", "#F8F6EE"],
  ["midnight", "Midnight", "#07140F"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>("forest");
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "forest");
  }, []);

  function pick(id: string) {
    document.documentElement.dataset.theme = id;
    localStorage.setItem("stayscape-theme", id);
    setTheme(id);
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-3 text-fg">
          <Logo className="h-8 w-8 text-accent" />
          <span className="font-display text-2xl">StayScape</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/explore" className="text-muted transition hover:text-fg">Explore hotels</Link>
          <Link href="/#destinations" className="text-muted transition hover:text-fg">Destinations</Link>
          <Link href="/book" className="text-muted transition hover:text-fg">Book a stay</Link>
          {user && (
            <Link href="/bookings" className="flex items-center gap-1.5 text-muted transition hover:text-fg">
              <Calendar className="h-3.5 w-3.5" />
              <span>My Bookings</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
            {THEMES.map(([id, label, color]) => (
              <button
                key={id}
                onClick={() => pick(id)}
                aria-label={`${label} theme`}
                aria-pressed={theme === id}
                title={`${label} theme`}
                style={{ background: color }}
                className={`h-5 w-5 rounded-full border-2 ${theme === id ? "border-accent" : "border-fg/30"}`}
              />
            ))}
          </div>

          {!loading && (
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/bookings"
                    className="flex items-center gap-2 rounded-full border border-fg/15 px-3 py-1.5 text-xs text-fg hover:border-accent transition"
                    title={`Logged in as ${user.name}`}
                  >
                    <UserIcon className="h-3.5 w-3.5 text-accent" />
                    <span className="max-w-[100px] truncate font-medium">{user.name.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="rounded-full p-2 text-muted hover:text-fg transition hover:bg-fg/5"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-medium text-muted hover:text-fg transition px-3 py-1.5"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="btn-accent text-xs px-3.5 py-1.5"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          )}

          <button className="text-fg md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-3 rounded-2xl p-5 md:hidden">
          <Link href="/explore" onClick={() => setOpen(false)} className="text-fg">Explore hotels</Link>
          <Link href="/#destinations" onClick={() => setOpen(false)} className="text-fg">Destinations</Link>
          <Link href="/book" onClick={() => setOpen(false)} className="text-fg">Book a stay</Link>
          {user ? (
            <>
              <Link href="/bookings" onClick={() => setOpen(false)} className="text-fg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span>My Bookings</span>
              </Link>
              <div className="pt-2 border-t border-fg/10 flex items-center justify-between text-sm">
                <span className="text-muted flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-accent" />
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="text-xs text-rose-400 flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-fg/10 flex items-center gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted hover:text-fg"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="btn-accent text-xs px-4 py-2"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
