import { cn } from '~/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from './Accordion';

const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        'flex flex-row gap-1 items-center px-2.5 py-1 rounded-[96px] border',
        score > 69 ? 'bg-sky-100 border-sky-300'
        : score > 39 ? 'bg-amber-100 border-amber-300'
        : 'bg-rose-100 border-rose-300'
      )}>
      <img
        src={score > 69 ? '/icons/check.svg' : '/icons/warning.svg'}
        alt="score"
        className="size-4"
      />
      <p
        className={cn(
          'text-sm font-medium',
          score > 69 ? 'text-sky-900'
          : score > 39 ? 'text-amber-900'
          : 'text-rose-900'
        )}>
        {score}/100
      </p>
    </div>
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: 'good' | 'improve'; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            <img
              src={
                tip.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'
              }
              alt="score"
              className="size-5"
            />
            <p
              className={
                tip.type === 'good' ?
                  'text-sm font-medium text-emerald-800'
                : 'text-xs font-medium leading-5 text-[#FFD400] bg-slate-800/90 px-1.5 py-0.5 rounded-md'
              }>
              {tip.tip}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              'flex flex-col gap-2 rounded-2xl p-4',
              tip.type === 'good' ?
                'bg-gradient-to-b from-emerald-100 via-emerald-50/40 to-slate-50 border border-emerald-200 text-slate-950'
              :
                'bg-gradient-to-b from-amber-100 via-amber-50/40 to-slate-50 border border-amber-200 text-slate-950'
            )}>
            <div className="flex flex-row gap-2 items-center">
              <img
                src={
                  tip.type === 'good' ?
                    '/icons/check.svg'
                  : '/icons/warning.svg'
                }
                alt="score"
                className="size-5"
              />
              <p className="text-base font-semibold">{tip.tip}</p>
            </div>
            <p
              className={
                tip.type === 'good' ? 'text-sm text-slate-700' : 'text-sm'
              }>
              {tip.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title="Content"
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title="Skills"
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;
