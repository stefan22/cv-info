import React, {useEffect} from "react";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import MainNavbar from "~/components/MainNavbar";

export const meta = () => ([
  {title: "Cake®Stack | Auth"},
  {name: "description", content: "Login"}
])

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split('next=')[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);

  }, [auth.isAuthenticated, next]);

  return (
    <main>
      <MainNavbar />
        <section className="flex w-full items-center justify-center flex-col gap-8 bg-white rounded-2xl p-6">

          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Access your CV results</h2>
          </div>
          <div className="flex p-8">
            {isLoading ? (
                <button className="auth-button">
                  <p>Signin</p>
                </button>
            ) : (
                <>
                  {auth.isAuthenticated ? (
                      <button className="auth-button" onClick={auth.signOut}>
                        <p>Log Out</p>
                      </button>
                  ) : (
                      <button className="auth-button" onClick={auth.signIn}>
                        <p>Log In</p>
                      </button>
                  )}
                </>
            )}
          </div>
        </section>

    </main>
  );
};

export default Auth;
