import { Link } from "react-router";

import ScoreCircle from "~/components/ScoreCircle";

const CVCard = ({
  cv: { id, companyName, jobTitle, feedback, imagePath },
  to,
}: {
  cv: CV;
  to?: string;
}) => {
  return (
    <Link
      to={to ?? `/cv/${id}`}
      className="group flex flex-col gap-4 w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition animate-in fade-in duration-1000"
    >
      <div className="flex flex-row gap-2 justify-between items-start">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {companyName && (
            <p className="text-base font-semibold text-neutral-900 truncate">
              {companyName}
            </p>
          )}
          {jobTitle && (
            <p className="text-sm text-gray-500 truncate">{jobTitle}</p>
          )}
          {!companyName && !jobTitle && (
            <p className="text-base font-semibold text-neutral-900">CV</p>
          )}
        </div>
        <div className="shrink-0 scale-[0.85] origin-top-right">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {imagePath ? (
        <div className="w-full overflow-hidden rounded-xl">
          <div className="aspect-[210/297] w-full">
            <img
              src={imagePath}
              alt={`${companyName ?? "CV"} preview`}
              loading="lazy"
              className="w-full h-full object-cover object-top group-hover:scale-[1.01] transition"
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
};

export default CVCard;
