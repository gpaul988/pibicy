import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState, useEffect } from "react";

const FilePreview = ({ file }) => {
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  const fileType = file.type;

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-2">File Preview</h2>

      {fileType.startsWith("image/") && (
        <img src={fileUrl} alt="Preview" className="max-w-full h-auto rounded" />
      )}

      {fileType === "application/pdf" && (
        <div className="h-96 border">
          <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} />
          </Worker>
        </div>
      )}

      {!fileType.startsWith("image/") && fileType !== "application/pdf" && (
        <p className="text-gray-600">Preview not available for this file type.</p>
      )}
    </div>
  );
};

export default FilePreview;