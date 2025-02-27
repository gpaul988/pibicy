import { useState } from "react";

const FileUploader = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-2 border p-2 rounded"
      />
      {fileName && <p className="text-sm text-gray-600">Selected: {fileName}</p>}
    </div>
  );
};

export default FileUploader;