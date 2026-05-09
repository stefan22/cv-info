import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import CVCard from "~/components/CVCard";
import { usePuterStore } from "~/lib/puter";

type StoredCv = Omit<CV, "feedback"> & {
  feedback: Feedback | string;
};

export const meta = () => [
  { title: "Cake®Stack | Dashboard" },
  { name: "description", content: "View and revisit your CV analyses." },
];

const Dashboard = () => {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      void navigate("/auth?next=%2Fdashboard");
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const objectUrls: string[] = [];

    const loadCVs = async () => {
      setIsFetching(true);
      const listed = await kv.list("cv:*", true);
      if (!listed) {
        setCvs([]);
        setIsFetching(false);
        return;
      }

      const items: StoredCv[] = [];

      if (
        Array.isArray(listed) &&
        listed.length > 0 &&
        typeof listed[0] === "object" &&
        listed[0] !== null &&
        "value" in listed[0]
      ) {
        for (const entry of listed as KVItem[]) {
          try {
            items.push(JSON.parse(entry.value) as StoredCv);
          } catch {
            // Ignore malformed entries and keep rendering valid CVs.
          }
        }
      } else if (Array.isArray(listed)) {
        const values = await Promise.all(
          listed.map((key) => kv.get(key as string))
        );

        for (const value of values) {
          if (!value) continue;
          try {
            items.push(JSON.parse(value) as StoredCv);
          } catch {
            // Ignore malformed entries and keep rendering valid CVs.
          }
        }
      }

      const normalized = (
        await Promise.all(
          items.map(async (item) => {
            let parsedFeedback: Feedback | null = null;
            if (typeof item.feedback === "string") {
              try {
                parsedFeedback = JSON.parse(item.feedback) as Feedback;
              } catch {
                parsedFeedback = null;
              }
            } else {
              parsedFeedback = item.feedback;
            }

            let previewImagePath = item.imagePath ?? "";
            if (item.imagePath) {
              const imageBlob = await fs.read(item.imagePath);
              if (imageBlob) {
                const url = URL.createObjectURL(imageBlob);
                objectUrls.push(url);
                previewImagePath = url;
              }
            }

            return {
              ...item,
              imagePath: previewImagePath,
              feedback: parsedFeedback,
            };
          })
        )
      )
        .map((item) => {
          return item;
        })
        .filter((cv): cv is CV => typeof cv.feedback?.overallScore === "number")
        .sort((a, b) => b.id.localeCompare(a.id));

      setCvs(normalized);
      setIsFetching(false);
    };

    void loadCVs();
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [auth.isAuthenticated, kv, fs]);

  if (isLoading || !auth.isAuthenticated) {
    return (
      <main className="relative">
        <section className="w-full max-w-[88rem] mx-auto px-6 pt-20 pb-12 text-center">
          <h2>{isLoading ? "Loading..." : "Redirecting to sign in..."}</h2>
        </section>
      </main>
    );
  }

  return (
    <main className="relative">
      <section className="w-full max-w-[88rem] mx-auto px-6 pt-20 pb-12">
        <div className="page-heading !max-w-none !items-start !text-left">
          <h1>Your CV Scores</h1>
          <h2>Click on a CV to review recommendations.</h2>
        </div>

        {isFetching ? (
          <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <h2 className="!text-base">Loading your CVs...</h2>
          </div>
        ) : cvs.length === 0 ? (
          <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center flex flex-col gap-4 items-center">
            <h2 className="!text-base">No CVs uploaded yet</h2>
            <p className="text-sm text-dark-200">
              Upload a CV to get your first ATS score and actionable feedback.
            </p>
            <Link to="/upload" className="primary-button !w-auto px-6">
              Upload CV
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {cvs.map((cv) => (
              <CVCard key={cv.id} cv={cv} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
