import { Stage, Layer, Rect, Text } from "react-konva";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AnnotationCanvas = ({ width, height, fileName }) => {
  const [annotations, setAnnotations] = useState([]);
  const stageRef = useRef(null);

  // Load saved annotations when file changes
  useEffect(() => {
    if (fileName) {
      const savedAnnotations = localStorage.getItem(`annotations-${fileName}`);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      } else {
        setAnnotations([]);
      }
    }
  }, [fileName]);

  const addText = () => {
    setAnnotations([...annotations, { id: Date.now(), type: "text", text: "New Text", x: 50, y: 50 }]);
  };

  const addRectangle = () => {
    setAnnotations([...annotations, { id: Date.now(), type: "rect", x: 100, y: 100, width: 100, height: 50, fill: "rgba(0,0,255,0.3)" }]);
  };

  const addTransparentHighlight = () => {
    setAnnotations([...annotations, { id: Date.now(), type: "highlight", x: 50, y: 50, width: 150, height: 50, fill: "rgba(255, 255, 0, 0.4)" }]);
  };

  const addOpaqueHighlight = () => {
    setAnnotations([...annotations, { id: Date.now(), type: "opaque", x: 50, y: 50, width: 150, height: 50, fill: "rgba(0, 0, 0, 1)" }]);
  };

  const saveAnnotations = () => {
    localStorage.setItem(`annotations-${fileName}`, JSON.stringify(annotations));
    alert("Annotations saved!");
  };

  // Export as Image
  const exportAsImage = async () => {
    if (stageRef.current) {
      const canvas = await html2canvas(stageRef.current.container());
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fileName}-annotated.png`;
      link.click();
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    if (stageRef.current) {
      const canvas = await html2canvas(stageRef.current.container());
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}-annotated.pdf`);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <button onClick={addText} className="p-2 bg-blue-500 text-white rounded">Add Text</button>
        <button onClick={addRectangle} className="p-2 bg-green-500 text-white rounded">Add Rectangle</button>
        <button onClick={addTransparentHighlight} className="p-2 bg-yellow-500 text-white rounded">Add Highlight</button>
        <button onClick={addOpaqueHighlight} className="p-2 bg-gray-700 text-white rounded">Add Opaque Mask</button>
        <button onClick={saveAnnotations} className="p-2 bg-purple-500 text-white rounded">Save Annotations</button>
        <button onClick={exportAsImage} className="p-2 bg-red-500 text-white rounded">Export as Image</button>
        <button onClick={exportAsPDF} className="p-2 bg-orange-500 text-white rounded">Export as PDF</button>
      </div>

      <Stage ref={stageRef} width={width} height={height} className="border shadow-md">
        <Layer>
          {annotations.map((anno) =>
            anno.type === "text" ? (
              <Text key={anno.id} text={anno.text} x={anno.x} y={anno.y} fontSize={16} draggable />
            ) : (
              <Rect key={anno.id} x={anno.x} y={anno.y} width={anno.width} height={anno.height} fill={anno.fill} draggable />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;