import { type FormEvent, useEffect, useState } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import convertPdfToImage from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '~/constants';

const uploadLabelClass = 'text-sm max-sm:pl-[5px]';

const uploadInputClass =
  'box-border h-12 w-full min-w-0 max-sm:!w-full max-sm:max-w-none max-sm:px-4 max-sm:text-base self-stretch rounded-md border border-solid border-[#dadce0] bg-white px-3 py-2 text-sm leading-snug focus:border-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100';

const uploadTextareaClass =
  'box-border min-h-24 w-full min-w-0 max-sm:!w-full max-sm:max-w-none max-sm:px-4 max-sm:text-base self-stretch rounded-md border border-solid border-[#dadce0] bg-white px-3 py-2 text-sm leading-snug focus:border-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100';

const authCtaMobile =
  'max-sm:!min-h-12 max-sm:!py-3 max-sm:!inline-flex max-sm:!items-center max-sm:!justify-center';

const Upload = () => {
  const { auth, isLoading: storeLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!storeLoading && !auth.isAuthenticated) {
      void navigate(`/auth?next=${encodeURIComponent('/upload')}`);
    }
  }, [auth.isAuthenticated, storeLoading, navigate]);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyse = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    const fail = (message: string) => {
      setStatusText(message);
      setIsProcessing(false);
    };

    setStatusText('Uploading the file...');
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) {
      fail('Error: Failed to upload file');
      return;
    }

    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) {
      fail(`Error: ${imageFile.error ?? 'Failed to convert PDF to image'}`);
      return;
    }

    setStatusText('Uploading the image...');
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) {
      fail('Error: Failed to upload image');
      return;
    }

    setStatusText('Preparing data...');
    const uuid = generateUUID();
    const data = {
      id: uuid,
      cvPath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: '' as string | Feedback,
    };

    console.log('data  ', data);

    await kv.set(`cv:${uuid}`, JSON.stringify(data));

    setStatusText('Analysing…');

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) {
      fail('Error: Failed to analyse CV');
      return;
    }

    const content = feedback.message.content;
    const feedbackText =
      typeof content === 'string' ? content
      : Array.isArray(content) && content[0] && 'text' in content[0] ?
        (content[0] as { text: string }).text
      : null;
    if (feedbackText === null) {
      fail('Error: Unexpected AI response');
      return;
    }

    try {
      data.feedback = JSON.parse(feedbackText) as Feedback;
    } catch {
      fail('Error: Invalid feedback from AI');
      return;
    }

    console.log('data  ', data);

    await kv.set(`cv:${uuid}`, JSON.stringify(data));
    setStatusText('Analysis complete, redirecting...');
    navigate(`/cv/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if (!file) return;

    handleAnalyse({ companyName, jobTitle, jobDescription, file });
  };

  if (storeLoading || !auth.isAuthenticated) {
    return (
      <main className="relative min-h-[calc(100svh-4.5rem)] w-full overflow-x-hidden overflow-y-auto !min-h-0 sm:flex sm:items-center sm:justify-center sm:py-12">
        <div className="mx-auto w-full max-w-md px-6 pb-12 pt-20 sm:max-w-xl sm:px-8 sm:pb-0 sm:pt-0">
          <div className="w-full border-0 bg-transparent p-0 shadow-none max-sm:backdrop-blur-none sm:rounded-3xl sm:border sm:border-gray-100/80 sm:bg-white/95 sm:p-8 sm:shadow-sm sm:backdrop-blur">
            <div className="mb-10 flex flex-col items-center gap-2 text-center max-sm:items-start max-sm:text-left">
              <h2>{storeLoading ? 'Loading…' : 'Redirecting to sign in…'}</h2>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100svh-4.5rem)] w-full overflow-x-hidden overflow-y-auto !min-h-0 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="mx-auto w-full max-w-md px-6 pb-12 pt-20 sm:max-w-xl sm:px-8 sm:pb-0 sm:pt-0">
        <div className="w-full border-0 bg-transparent p-0 shadow-none max-sm:backdrop-blur-none sm:rounded-3xl sm:border sm:border-gray-100/80 sm:bg-white/95 sm:p-8 sm:shadow-sm sm:backdrop-blur">
          <div className="mb-10 flex flex-col items-center gap-2 text-center max-sm:items-start max-sm:text-left">
            <h1 className="max-w-xl text-balance">
              Smart feedback for your dream job
            </h1>

            {isProcessing ?
              <>
                <h2 className="max-w-xl text-balance">{statusText}</h2>
                <img
                  src="/images/cv-scan.gif"
                  alt="Scanning…"
                  className="mt-4 w-full max-w-md"
                />
              </>
            : (
              <>
                <h2 className="max-w-xl text-balance">
                  Upload a PDF file to analyse your CV
                </h2>
                <p className="max-w-xl text-balance text-sm leading-relaxed text-neutral-700">
                  Get an ATS score and tailored improvement tips in seconds.
                </p>
              </>
            )}
          </div>

          {!isProcessing ?
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex w-full max-w-full flex-col gap-0 text-sm max-sm:items-stretch"
            >
              <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
                <div className="form-div !gap-2 max-sm:w-full">
                  <label htmlFor="company-name" className={uploadLabelClass}>
                    Company name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    name="company-name"
                    placeholder="Company name"
                    className={uploadInputClass}
                  />
                </div>
                <div className="form-div !gap-2 max-sm:w-full">
                  <label htmlFor="job-title" className={uploadLabelClass}>
                    Job title
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    name="job-title"
                    required
                    placeholder="Enter the target job title"
                    className={uploadInputClass}
                  />
                </div>
                <div className="form-div !gap-2 max-sm:w-full">
                  <label htmlFor="job-description" className={uploadLabelClass}>
                    Job description
                  </label>
                  <textarea
                    id="job-description"
                    rows={4}
                    name="job-description"
                    required
                    placeholder="Copy and paste the target job description to scan your CV against"
                    className={uploadTextareaClass}
                  />
                </div>
                <div className="form-div !gap-2 max-sm:w-full">
                  <FileUploader
                    selectedFile={file}
                    onFileSelect={handleFileSelect}
                    label="CV file"
                    labelClassName={uploadLabelClass}
                    inputId="uploader"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!file}
                className={`primary-button ${authCtaMobile} mt-10 w-full text-sm disabled:opacity-60 sm:!min-h-12 sm:!py-3`}
              >
                Analyse CV
              </button>
            </form>
          : null}
        </div>
      </div>
    </main>
  );
};

export default Upload;
