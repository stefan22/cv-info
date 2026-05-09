import ScoreGauge from '~/components/ScoreGauge';
import ScoreBadge from '~/components/ScoreBadge';

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70 ? 'text-green-600'
    : score > 49 ? 'text-yellow-600'
    : 'text-red-600';

  return (
    <div className="resume-summary px-4 pb-3">
      <div className="category rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <p className="text-base font-semibold text-gray-800">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-lg font-semibold text-gray-700">
          <span className={textColor}>{score}</span>/100
        </p>
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={feedback.overallScore} />

        <div className="flex flex-col gap-2">
          <h2 className="!text-lg font-semibold">Your CV Score</h2>
          <p className="text-sm text-gray-500">
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>

      <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
      <Category title="Content" score={feedback.content.score} />
      <Category title="Structure" score={feedback.structure.score} />
      <Category title="Skills" score={feedback.skills.score} />
    </div>
  );
};
export default Summary;
