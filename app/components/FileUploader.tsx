import { useCallback, useEffect, useState } from "react";
import type { FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { cn, formatSize } from "~/lib/utils";

interface FileUploaderProps {
  /** Parent-controlled selection so the UI stays in sync (avoids remount + dropzone reset bugs). */
  selectedFile: File | null;
  onFileSelect?: (file: File | null) => void;
  /** When set, label is shown on the left; PDF validation errors align to the right on the same row. */
  label?: string;
  /** Classes for the label (e.g. upload form label styles). */
  labelClassName?: string;
  /** `id` forwarded to the hidden file input — use with `label` for a11y */
  inputId?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function fileIsPdfExtensionOnly(file: File): boolean {
  /** Require a real *.pdf basename (dropzone MIME filter can still leak odd OS-reported types). */
  return /\.pdf$/i.test(file.name.trim());
}

function shouldShowPdfOnlyRejected(rejections: FileRejection[]): boolean {
  return rejections.some((r) =>
    r.errors.some((e) => e.code === "file-invalid-type"),
  );
}

const FileUploader = ({
  selectedFile,
  onFileSelect,
  label,
  labelClassName,
  inputId = "cv-file-upload",
}: FileUploaderProps) => {
  const [pdfOnlyMessage, setPdfOnlyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPdfOnlyMessage(null);
    }
  }, [selectedFile]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      setPdfOnlyMessage(null);

      if (rejections.length > 0 && shouldShowPdfOnlyRejected(rejections)) {
        setPdfOnlyMessage("PDF only allowed");
        return;
      }

      const next = acceptedFiles[0];
      if (!next) {
        return;
      }

      if (!fileIsPdfExtensionOnly(next)) {
        setPdfOnlyMessage("PDF only allowed");
        return;
      }

      onFileSelect?.(next);
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_SIZE,
  });

  const file = selectedFile;

  const root = (
    <div
      {...getRootProps()}
      className={`w-full cursor-pointer rounded-md border border-dashed border-[#dadce0] bg-white px-4 py-3 transition hover:border-neutral-400 ${
        isDragActive ? "border-blue-400 bg-blue-50/40" : ""
      }`}
    >
      <input
        key={
          selectedFile
            ? `${selectedFile.name}-${selectedFile.lastModified}`
            : "empty"
        }
        {...getInputProps({ id: inputId })}
      />

      {file ? (
        <div
          className="flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src="/images/pdf.png" alt="pdf" className="size-8 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-100"
            aria-label="Remove file"
            onClick={(e) => {
              e.preventDefault();
              onFileSelect?.(null);
            }}
          >
            <img src="/icons/cross.svg" alt="" className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <img
            src="/icons/info.svg"
            alt=""
            aria-hidden
            className="size-7 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Click to upload</span> or drag
              and drop
            </p>
            <p className="text-xs text-gray-500">
              PDF ONLY (max {formatSize(MAX_FILE_SIZE)})
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (!label) {
    return root;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-row items-baseline justify-between gap-3">
        <label htmlFor={inputId} className={cn(labelClassName)}>
          {label}
        </label>
        {pdfOnlyMessage ?
          <span
            className="shrink-0 text-right text-xs font-medium leading-tight text-badge-red-text"
            role="alert"
          >
            {pdfOnlyMessage}
          </span>
        : null}
      </div>
      {root}
    </div>
  );
};

export default FileUploader;
