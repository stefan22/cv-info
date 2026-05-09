import type { Route } from "./+types/home";
import {Link} from "react-router";
import CVCard from "~/components/CVCard";
import {cvs} from "~/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cake®Stack | Dashboard" },
    {
      name: "description",
      content: "Get a free ATS-style CV review, scores, and improvement tips tailored to your next role.",
    },
  ];
}

export default function Home() {
  return (
    <main className="relative">
      <section className="w-full max-w-[88rem] mx-auto px-6 pt-20 pb-12">
        <div className="page-heading !max-w-none !items-start !text-left">
          <h1>Free CV Insights, Powered by AI</h1>
          <h2>
            See strengths, gaps, and next steps tailored to your CV in seconds
          </h2>
        </div>

        {cvs.length > 0 && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {cvs.slice(0, 3).map((cv) => (
              <CVCard key={cv.id} cv={cv} to="/upload" />
            ))}

            <div className="col-span-full my-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="!text-xl">
                  Upload your CV to find out more
                </h3>
                <p className="text-sm text-dark-200 mt-1">
                  Get an instant ATS score and tailored tips for your next role.
                </p>
              </div>
              <Link
                to="/upload"
                className="primary-button !w-auto px-6 whitespace-nowrap"
              >
                Upload CV
              </Link>
            </div>

            {cvs.slice(3).map((cv) => (
              <CVCard key={cv.id} cv={cv} to="/upload" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
