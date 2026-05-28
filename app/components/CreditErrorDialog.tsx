import { useEffect } from 'react';

import {
  CREDIT_ERROR_HEADING,
  CREDIT_ERROR_PARAGRAPH_1,
  CREDIT_ERROR_PARAGRAPH_2,
} from '~/lib/puter';

interface CreditErrorDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreditErrorDialog = ({ open, onClose }: CreditErrorDialogProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const linkParts = CREDIT_ERROR_PARAGRAPH_1.split('puter.com');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-error-title"
        className="w-full max-w-md rounded-3xl border border-gray-100/80 bg-white p-8 shadow-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="credit-error-title"
          className="mb-4 text-center text-xl font-normal text-black"
        >
          {CREDIT_ERROR_HEADING}
        </h2>
        <p className="text-sm leading-relaxed text-neutral-700">
          {linkParts[0]}
          <a
            href="https://puter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            puter.com
          </a>
          {linkParts[1]}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          {CREDIT_ERROR_PARAGRAPH_2}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="primary-button mt-6 w-full text-sm sm:!min-h-12 sm:!py-3"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default CreditErrorDialog;
