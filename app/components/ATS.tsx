import React from 'react';

interface Suggestion {
  type: 'good' | 'improve';
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  // Determine background gradient based on score
  const gradientClass =
    score > 69 ? 'from-emerald-50'
    : score > 49 ? 'from-yellow-100'
    : 'from-red-100';

  // Determine icon based on score
  const iconSrc =
    score > 69 ? '/icons/ats-good.svg'
    : score > 49 ? '/icons/ats-warning.svg'
    : '/icons/ats-bad.svg';

  // Determine subtitle based on score
  const subtitle =
    score > 69 ? 'Great Job!'
    : score > 49 ? 'Good Start'
    : 'Needs Improvement';

  return (
    <div
      className={`bg-gradient-to-b ${gradientClass} via-white/95 to-white rounded-2xl border border-gray-100 shadow-md w-full p-6`}>
      {/* Top section with icon and headline */}
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <h2 className="text-lg font-semibold !text-black">ATS Score - {score}/100</h2>
        </div>
      </div>

      {/* Description section */}
      <div className="mb-6">
        <h3
          className={`text-base font-semibold mb-2 ${
            score > 69 ? "text-green-800" : score > 49 ? "text-amber-800" : "text-rose-800"
          }`}
        >
          {subtitle}
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          This score represents how well your CV is likely to perform in
          Applicant Tracking Systems used by employers.
        </p>

        {/* Suggestions list */}
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={
                  suggestion.type === 'good' ?
                    '/icons/check.svg'
                  : '/icons/warning.svg'
                }
                alt={suggestion.type === 'good' ? 'Check' : 'Warning'}
                className="w-5 h-5 mt-0.5"
              />
              <p
                className={
                  suggestion.type === 'good' ?
                    'text-sm font-medium text-emerald-800'
                  : 'text-xs font-medium leading-5 text-[#FFD400] bg-slate-800/90 px-1.5 py-0.5 rounded-md'
                }>
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Closing encouragement */}
      <p className="text-sm text-gray-700 italic">
        Keep refining your resume to improve your chances of getting past ATS
        filters and into the hands of recruiters.
      </p>
    </div>
  );
};

export default ATS;
