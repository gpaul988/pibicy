import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState, useEffect } from "react";
import AnnotationCanvas from "./AnnotationCanvas";

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
        <div className="relative">
          <img src={fileUrl} alt="Preview" className="max-w-full h-auto rounded" />
          <AnnotationCanvas width={600} height={400} />
        </div>
      )}

      {fileType === "application/pdf" && (
        <div className="h-96 border">
          <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js">
            <Viewer fileUrl={fileUrl} />
          </Worker>
          <AnnotationCanvas width={600} height={400} />
        </div>
      )}

      {!fileType.startsWith("image/") && fileType !== "application/pdf" && (
        <p className="text-gray-600">Preview not available for this file type.</p>
      )}
    </div>
  );
};

export default FilePreview;
