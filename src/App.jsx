import { useState } from "react";
import FileUploader from "./components/FileUploader";
import FilePreview from "./components/FilePreview";
import AnnotationCanvas from "./components/AnnotationCanvas";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">File Viewer & Annotation</h1>
      <FileUploader onFileSelect={setSelectedFile} />
      <FilePreview file={selectedFile} />
      {selectedFile && <AnnotationCanvas file={selectedFile} />}
    </div>
  );
}

export default App;
