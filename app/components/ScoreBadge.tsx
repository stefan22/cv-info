interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = '';
  let badgeText = '';

  if (score > 70) {
    badgeColor = 'bg-blue-600 text-white border border-blue-700';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-amber-300 text-amber-950 border border-amber-400';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-rose-600 text-white border border-rose-700';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
