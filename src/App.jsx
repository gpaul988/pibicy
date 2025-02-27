import { useState } from "react";
import FileUploader from "./components/FileUploader";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">File Viewer & Annotation</h1>
      <FileUploader onFileSelect={setSelectedFile} />
      {selectedFile && (
        <p className="mt-4 text-lg">File ready for processing: {selectedFile.name}</p>
      )}
    </div>
  );
}

export default App;
