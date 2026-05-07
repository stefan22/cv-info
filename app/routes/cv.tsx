import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import Details from '~/components/Details';
import ATS from '~/components/ATS';
import Summary from '~/components/Summary';

type StoredCv = Omit<CV, 'feedback'> & {
  feedback: Feedback | string;
  jobDescription?: string;
};

// const CATEGORY_LABELS: {
//   key: keyof Pick<
//     Feedback,
//     'ATS' | 'toneAndStyle' | 'content' | 'structure' | 'skills'
//   >;
//   label: string;
// }[] = [
//   { key: 'ATS', label: 'ATS' },
//   { key: 'toneAndStyle', label: 'Tone & style' },
//   { key: 'content', label: 'Content' },
//   { key: 'structure', label: 'Structure' },
//   { key: 'skills', label: 'Skills' },
// ];

// function normalizeFeedback(raw: Feedback | string): Feedback | null {
//   if (typeof raw === 'object' && raw !== null && 'overallScore' in raw) {
//     return raw as Feedback;
//   }
//   if (typeof raw === 'string') {
//     try {
//       const parsed = JSON.parse(raw) as Feedback;
//       if (parsed) {
//         return parsed;
//       }
//     } catch {
//       return null;
//     }
//   }
//   return null;
// }

export const meta = () => {
  return [
    { title: 'Cake®Stack | CV Review' },
    { name: 'description', content: 'Detailed overview of your CV' },
  ];
};

export default function CvDetailRoute() {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();

  const [imageUrl, setImageUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/cv/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadCV = async () => {
      const cv = await kv.get(`cv:${id}`);

      if (!cv) return;

      const data = JSON.parse(cv);

      const cvBlob = await fs.read(data.cvPath);
      if (!cvBlob) return;

      const pdfBlob = new Blob([cvBlob], { type: 'application/pdf' });
      const cvUrl = URL.createObjectURL(pdfBlob);
      setCvUrl(cvUrl);

      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);

      setFeedback(data.feedback);
      console.log({ cvUrl, imageUrl, feedback: data.feedback });
    };

    loadCV();
  }, [id]);

  return (
    <main className="pt-0!">
      {feedback && (
        <div className="w-full max-w-[88rem] mx-auto px-6">
          <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-screen sticky top-0 items-center justify-center !px-4">
            {imageUrl && cvUrl && (
              <div className="animate-in fade-in duration-1000 cv-screenshot-frame max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    title="CV"
                    alt="CV Screenshot"
                  />
                </a>
              </div>
            )}
            </section>
            <section className="feedback-section !px-4">
              <h2
                className="relative z-20 text-4xl font-bold mt-[5vh] text-right mr-[10px] inline-block self-end rounded-md bg-white/85 backdrop-blur-[1px] px-2 py-1"
                style={{ color: '#2b2b2b', opacity: 0.95 }}>
                CV Review
              </h2>
              {feedback ?
                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                  <Summary feedback={feedback} />
                  <ATS
                    score={feedback.ATS.score || 0}
                    suggestions={feedback.ATS.tips || []}
                  />
                  <Details feedback={feedback} />
                </div>
              : <img src="/images/cv-scan.gif" className="w-full" alt="CV Scan" />
              }
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
