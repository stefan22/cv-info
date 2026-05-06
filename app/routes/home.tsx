import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import CVCard from "~/components/CVCard";
import {cvs} from "../../constants";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";
import MainNavbar from "~/components/MainNavbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const { isLoading, auth } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) navigate('/');

    }, [auth.isAuthenticated]);
  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">

          <MainNavbar />

        <Navbar />

        <section className="main-section">
          <div className="page-heading py-8">
            <h1>Track Your Applications & CV Ratings</h1>
              <h2>Review your submissions and check AI-powered feedback.</h2>
          </div>
        </section>

          <section className="main-sub-section">
          {cvs.length > 0 && (
              <div className="cv-section">
                  {cvs.map((cv,i) => (
                      <CVCard key={cv.id} cv={cv} />
                  ))}
              </div>
          )}
        </section>
      </main>
        )
}
