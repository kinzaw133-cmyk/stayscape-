export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      <path d="M10 42V22a14 14 0 0 1 28 0v20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 42h40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="18" r="3.5" fill="#D4AF37" />
    </svg>
  );
}
