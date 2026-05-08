import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";

interface FileUploaderProps {
  /** Parent-controlled selection so the UI stays in sync (avoids remount + dropzone reset bugs). */
  selectedFile: File | null;
  onFileSelect?: (file: File | null) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const FileUploader = ({ selectedFile, onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
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

  return (
    <div
      {...getRootProps()}
      className={`w-full rounded-xl border border-dashed transition cursor-pointer px-4 py-3 ${
        isDragActive
          ? "border-blue-400 bg-blue-50/40"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <input
        key={
          selectedFile
            ? `${selectedFile.name}-${selectedFile.lastModified}`
            : "empty"
        }
        {...getInputProps()}
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
            className="p-1.5 rounded-full hover:bg-gray-100"
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
              PDF (max {formatSize(MAX_FILE_SIZE)})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
