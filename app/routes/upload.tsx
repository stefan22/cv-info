import { type FormEvent, useEffect, useState } from 'react';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import convertPdfToImage from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '~/constants';

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

  const handleAnalyze = async ({
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

    setStatusText('Analyzing...');

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) {
      fail('Error: Failed to analyse cv');
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

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  if (storeLoading || !auth.isAuthenticated) {
    return (
      <main className="relative">
        <section className="w-full max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
          <h2>{storeLoading ? 'Loading…' : 'Redirecting to sign in…'}</h2>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex h-[calc(100svh-4.5rem)] max-h-[calc(100svh-4.5rem)] w-full !min-h-0 !pt-0 items-center justify-center overflow-hidden px-3 py-2">
      <section className="w-full max-w-md mx-auto max-h-full min-h-0 overflow-y-auto px-4 py-4 flex flex-col items-center gap-6">
        <div className="w-full text-center flex flex-col gap-1">
          <h1 className="!text-xl sm:!text-2xl leading-snug">
            Smart feedback for your dream job
          </h1>
          {isProcessing ?
            <>
              <h2 className="!text-sm">{statusText}</h2>
              <img
                src="/images/cv-scan.gif"
                alt="Scanning…"
                className="w-full"
              />
            </>
          : (
            <>
              <h2 className="!text-sm">Upload a PDF file to analyse your CV</h2>
              <p className="text-sm text-dark-200 leading-relaxed px-1">
                Get an ATS score and tailored improvement tips in seconds.
              </p>
            </>
          )}
        </div>

        {!isProcessing && (
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            className="w-full mx-auto !gap-4 !items-stretch">
            <div className="w-full bg-white/95 backdrop-blur rounded-3xl border border-gray-100/80 p-5 shadow-sm sm:p-6 flex flex-col gap-4">
              <div className="form-div !gap-1.5">
                <label htmlFor="company-name" className="text-sm">
                  Company name
                </label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company name"
                  id="company-name"
                  className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
                />
              </div>
              <div className="form-div !gap-1.5">
                <label htmlFor="job-title" className="text-sm">
                  Job title
                </label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Enter the target job title"
                  id="job-title"
                  className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
                />
              </div>
              <div className="form-div !gap-1.5">
                <label htmlFor="job-description" className="text-sm">
                  Job description
                </label>
                <textarea
                  rows={4}
                  name="job-description"
                  placeholder="Copy and paste the target job description to scan your CV against"
                  id="job-description"
                  className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
                />
              </div>
              <div className="form-div !gap-1.5">
                <label htmlFor="uploader" className="text-sm">
                  CV file
                </label>
                <FileUploader
                  selectedFile={file}
                  onFileSelect={handleFileSelect}
                />
              </div>
            </div>

            <button
              className="primary-button mt-1 text-sm"
              type="submit"
              disabled={!file}>
              Analyse CV
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default Upload;
