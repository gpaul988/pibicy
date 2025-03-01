import { Stage, Layer, Rect, Text } from "react-konva";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AnnotationCanvas = ({ width, height, fileName }) => {
  const [annotations, setAnnotations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
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

  const saveAnnotations = () => {
    localStorage.setItem(`annotations-${fileName}`, JSON.stringify(annotations));
    alert("Annotations saved!");
  };

  const deleteAnnotation = () => {
    if (selectedId) {
      setAnnotations(annotations.filter((anno) => anno.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <button onClick={addText} className="p-2 bg-blue-500 text-white rounded">Add Text</button>
        <button onClick={addRectangle} className="p-2 bg-green-500 text-white rounded">Add Rectangle</button>
        <button onClick={saveAnnotations} className="p-2 bg-purple-500 text-white rounded">Save Annotations</button>
        <button onClick={deleteAnnotation} className="p-2 bg-red-500 text-white rounded" disabled={!selectedId}>
          Delete Selected
        </button>
      </div>

      <Stage ref={stageRef} width={width} height={height} className="border shadow-md">
        <Layer>
          {annotations.map((anno) =>
            anno.type === "text" ? (
              <Text
                key={anno.id}
                text={anno.text}
                x={anno.x}
                y={anno.y}
                fontSize={16}
                draggable
                onClick={() => setSelectedId(anno.id)}
              />
            ) : (
              <Rect
                key={anno.id}
                x={anno.x}
                y={anno.y}
                width={anno.width}
                height={anno.height}
                fill={anno.fill}
                draggable
                stroke={selectedId === anno.id ? "red" : "transparent"}
                strokeWidth={2}
                onClick={() => setSelectedId(anno.id)}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;