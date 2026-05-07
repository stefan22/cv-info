import type { Route } from "./+types/cv.$id";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";

type StoredCv = Omit<CV, "feedback"> & {
  feedback: Feedback | string;
  jobDescription?: string;
};

const CATEGORY_LABELS: {
  key: keyof Pick<
    Feedback,
    "ATS" | "toneAndStyle" | "content" | "structure" | "skills"
  >;
  label: string;
}[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "Tone & style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

function normalizeFeedback(raw: Feedback | string): Feedback | null {
  if (typeof raw === "object" && raw !== null && "overallScore" in raw) {
    return raw as Feedback;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as Feedback;
      if (parsed && typeof parsed.overallScore === "number") {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cake®Stack | CV feedback" },
    { name: "description", content: "CV analysis feedback" },
  ];
}

export default function CvDetailRoute() {
  const { id } = useParams();
  const { kv } = usePuterStore();
  const [cv, setCv] = useState<StoredCv | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("Missing CV id");
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      const raw = await kv.get(`cv:${id}`);
      if (cancelled) {
        return;
      }
      if (!raw) {
        setError("No CV found for this link.");
        setLoading(false);
        return;
      }
      try {
        const data = JSON.parse(raw) as StoredCv;
        setCv(data);
      } catch {
        setError("Could not read stored CV data.");
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, kv]);

  const feedback = useMemo(() => {
    if (!cv) {
      return null;
    }
    return normalizeFeedback(cv.feedback);
  }, [cv]);

  return (
    <main className="relative">
      <section className="main-section">
        <div className="page-heading py-8 max-w-5xl w-full">
          <Link to="/" className="back-button mb-6 inline-flex self-start">
            <img src="/icons/back.svg" alt="" className="size-5" />
            <span>Back to dashboard</span>
          </Link>

          {loading && <h2>Loading…</h2>}
          {error && (
            <>
              <h1>Something went wrong</h1>
              <p className="text-dark-200">{error}</p>
            </>
          )}
          {!loading && !error && cv && !feedback && (
            <>
              <h1>Feedback not ready</h1>
              <p className="text-dark-200">
                This CV record exists but analysis data is missing or invalid.
              </p>
            </>
          )}
          {!loading && !error && cv && feedback && (
            <>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 w-full text-left">
                <div>
                  {cv.companyName && (
                    <h1 className="!text-left">{cv.companyName}</h1>
                  )}
                  {cv.jobTitle && (
                    <h2 className="!text-left mt-2">{cv.jobTitle}</h2>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <span className="text-sm text-dark-200">Overall</span>
                  <ScoreCircle score={feedback.overallScore} />
                </div>
              </div>

              {cv.imagePath ? (
                <div className="mt-10 w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <img
                    src={cv.imagePath}
                    alt="CV preview"
                    className="w-full object-cover object-top max-h-[480px]"
                  />
                </div>
              ) : null}

              <div className="feedback-section w-full max-w-5xl mx-auto mt-12">
                <h2 className="text-2xl font-semibold mb-8 text-center md:text-left">
                  Detailed scores
                </h2>
                <div className="flex flex-col gap-10">
                  {CATEGORY_LABELS.map(({ key, label }) => {
                    const section = feedback[key];
                    if (!section) {
                      return null;
                    }
                    return (
                      <div key={key} className="gradient-border">
                        <div className="flex flex-row justify-between items-start gap-4 mb-4">
                          <h3 className="text-lg font-semibold text-black">
                            {label}
                          </h3>
                          <ScoreCircle score={section.score} />
                        </div>
                        {section.tips.length > 0 ? (
                          <ul className="space-y-4 text-dark-200">
                            {section.tips.map((tip, idx) => (
                              <li key={idx} className="rounded-xl bg-white/60 p-4">
                                <span
                                  className={
                                    tip.type === "good"
                                      ? "score-badge bg-badge-green text-badge-green-text"
                                      : "score-badge bg-badge-yellow text-badge-yellow-text"
                                  }
                                >
                                  {tip.type === "good" ? "Strength" : "Improve"}
                                </span>
                                <p className="mt-2 font-medium text-gray-800">
                                  {"tip" in tip ? tip.tip : ""}
                                </p>
                                {"explanation" in tip &&
                                typeof tip.explanation === "string" ? (
                                  <p className="mt-2 text-sm leading-relaxed">
                                    {tip.explanation}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-dark-200 text-sm">
                            No tips returned for this category.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
