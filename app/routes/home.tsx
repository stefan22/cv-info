import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import CVCard from "~/components/CVCard";
import {cvs} from "../../constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
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
