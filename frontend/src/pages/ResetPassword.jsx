import { Link } from 'react-router-dom';

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-ink">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="NaturePulse Logo" className="w-9 h-9 rounded-xl object-cover shadow-lg" />
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-ink tracking-tight">
            NaturePulse
          </span>
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">Account recovery</p>
          <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-[2rem] font-bold text-ink leading-tight">
            Password reset unavailable
          </h1>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
          <span className="mt-0.5 text-amber-500">⚠</span> Self-service password recovery is not available on this
          build. Please contact the event team for assistance.
        </div>

        <div className="mt-5">
          <Link
            to="/login"
            className="w-full inline-block text-center bg-ink text-paper rounded-xl py-3.5 text-sm font-semibold hover:bg-forest transition-all duration-200 shadow-md"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
