import { Stage, Layer, Rect, Text, Transformer } from "react-konva";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AnnotationCanvas = ({ width, height, fileName }) => {
  const [annotations, setAnnotations] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

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

  useEffect(() => {
    const transformer = transformerRef.current;
    if (transformer && selectedId) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const saveToHistory = () => {
    setHistory([...history, annotations]);
    setRedoStack([]); // Clear redo stack when making a new change
  };

  const undo = () => {
    if (history.length > 0) {
      setRedoStack([annotations, ...redoStack]);
      setAnnotations(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      setHistory([...history, annotations]);
      setAnnotations(redoStack[0]);
      setRedoStack(redoStack.slice(1));
    }
  };

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

  const deleteAnnotation = () => {
    if (selectedId) {
      saveToHistory();
      setAnnotations(annotations.filter((anno) => anno.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleTransformEnd = (e, id) => {
    const updatedAnnotations = annotations.map((anno) => {
      if (anno.id === id) {
        const node = e.target;
        return { ...anno, x: node.x(), y: node.y(), width: node.width(), height: node.height() };
      }
      return anno;
    });
    setAnnotations(updatedAnnotations);
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
        <button onClick={deleteAnnotation} className="p-2 bg-red-500 text-white rounded" disabled={!selectedId}>
          Delete Selected
        </button>
        <button onClick={undo} className="p-2 bg-yellow-500 text-white rounded" disabled={history.length === 0}>
          Undo
        </button>
        <button onClick={redo} className="p-2 bg-purple-500 text-white rounded" disabled={redoStack.length === 0}>
          Redo
        </button>
      </div>

      <Stage ref={stageRef} width={width} height={height} className="border shadow-md">
        <Layer>
          {annotations.map((anno) => (
            <React.Fragment key={anno.id}>
              {anno.type === "text" ? (
                <Text
                  id={anno.id}
                  text={anno.text}
                  x={anno.x}
                  y={anno.y}
                  fontSize={16}
                  draggable
                  onClick={() => setSelectedId(anno.id)}
                />
              ) : (
                <Rect
                  id={anno.id}
                  x={anno.x}
                  y={anno.y}
                  width={anno.width}
                  height={anno.height}
                  fill={anno.fill}
                  draggable
                  stroke={selectedId === anno.id ? "red" : "transparent"}
                  strokeWidth={2}
                  onClick={() => setSelectedId(anno.id)}
                  onTransformEnd={(e) => handleTransformEnd(e, anno.id)}
                />
              )}
            </React.Fragment>
          ))}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;