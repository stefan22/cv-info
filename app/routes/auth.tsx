import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Cake®Stack | Sign in" },
  { name: "description", content: "Sign in or create an account" },
];

type AuthMode = "signin" | "signup";

const Auth = () => {
  const { isLoading, auth, error, clearError } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const next = useMemo(() => {
    const raw = params.get("next");
    if (!raw) {
      return "/";
    }
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
    return "/";
  }, [params]);

  const initialMode: AuthMode =
    params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      void navigate(next);
    }
  }, [auth.isAuthenticated, next, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    await auth.signIn();
  };

  const isSignUp = mode === "signup";

  return (
    <main className="relative">
      <section className="flex w-full items-center justify-center px-4 pt-16 pb-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center gap-1 text-center mb-6">
            <h1 className="!text-2xl">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <h2 className="!text-sm">
              {isSignUp
                ? "Start tracking your CV feedback in seconds."
                : "Sign in to access your CV results."}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-gray-100 mb-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full py-2 transition ${
                mode === "signin"
                  ? "bg-white text-dark-200 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full py-2 transition ${
                mode === "signup"
                  ? "bg-white text-dark-200 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="!gap-3 text-sm">
            {isSignUp && (
              <div className="form-div">
                <label htmlFor="auth-name" className="text-sm">Full name</label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="!p-3 !text-sm !rounded-xl"
                />
              </div>
            )}

            <div className="form-div">
              <label htmlFor="auth-email" className="text-sm">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="!p-3 !text-sm !rounded-xl"
              />
            </div>

            <div className="form-div">
              <label htmlFor="auth-password" className="text-sm">Password</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="!p-3 !text-sm !rounded-xl"
              />
            </div>

            {error && (
              <p className="text-sm text-badge-red-text bg-badge-red rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="primary-button mt-2 text-sm disabled:opacity-60"
            >
              {isLoading
                ? "Opening Puter…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Authentication is securely handled by{" "}
              <a
                href="https://puter.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Puter
              </a>
              . Submitting will open Puter's sign-in window.
            </p>

            <p className="text-sm text-center text-dark-200 mt-2">
              {isSignUp ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                className="text-gradient font-semibold underline"
                onClick={() => setMode(isSignUp ? "signin" : "signup")}
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Auth;
