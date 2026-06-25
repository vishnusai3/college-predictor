import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-slate-950/70" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="max-w-3xl text-center">
          <p className="mb-6 text-sm uppercase tracking-[0.35em] text-cyan-300/80">Built by Vishnusai.G and team</p>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">The Premium EAMCET Predictor</h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/student-login"
              className="inline-flex min-w-[220px] justify-center rounded-full bg-cyan-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Start Prediction
            </Link>
            <Link
              to="/admin-login"
              className="inline-flex min-w-[220px] justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/20"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
