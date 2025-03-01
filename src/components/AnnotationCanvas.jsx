import { Stage, Layer, Rect, Text, Transformer } from "react-konva";
import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AnnotationCanvas = ({ width, height, fileName }) => {
  const [annotations, setAnnotations] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedIds, setSelectedIds] = useState(null);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  // Load saved annotations when file changes
  useEffect(() => {
    if (fileName) {
      const savedAnnotations = localStorage.getItem(`annotations-${fileName}`);
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    }
  }, [fileName]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (transformer) {
      const selectedNodes = selectedIds.map((id) => stageRef.current.findOne(`#${id}`)).filter(Boolean);
      transformer.nodes(selectedNodes);
      transformer.getLayer().batchDraw();
    }
  }, [selectedIds]);

  const handleExport = () => {
    const json = JSON.stringify(annotations, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName || "annotations"}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          setAnnotations(importedData);
        } else {
          alert("Invalid file format");
        }
      } catch (error) {
        alert(`Error reading file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

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
    setAnnotations([...annotations, { id: `anno-${Date.now()}`, type: "text", text: "New Text", x: 50, y: 50 }]);
  };

  const addRectangle = () => {
    setAnnotations([...annotations, { id: `anno-${Date.now()}`, type: "rect", x: 100, y: 100, width: 100, height: 50, fill: "rgba(0,0,255,0.3)" }]);
  };

  const addTransparentHighlight = () => {
    setAnnotations([...annotations, { id: `anno-${Date.now()}`, type: "highlight", x: 50, y: 50, width: 150, height: 50, fill: "rgba(255, 255, 0, 0.4)" }]);
  };

  const addOpaqueHighlight = () => {
    setAnnotations([...annotations, { id: `anno-${Date.now()}`, type: "opaque", x: 50, y: 50, width: 150, height: 50, fill: "rgba(0, 0, 0, 1)" }]);
  };

  const saveAnnotations = () => {
    localStorage.setItem(`annotations-${fileName}`, JSON.stringify(annotations));
    alert("Annotations saved!");
  };

  const deleteAnnotation = () => {
    if (selectedIds.length > 0) {
      saveToHistory();
      setAnnotations(annotations.filter((anno) => !selectedIds.includes(anno.id)));
      setSelectedIds(null);
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

  const handleClick = (id, e) => {
    if (e.shiftKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Delete") {
      deleteAnnotation();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.shiftKey ? redo() : undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      redo();
    }
  }, [annotations, history, redoStack, selectedIds, deleteAnnotation, undo, redo]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
        <button onClick={undo} className="p-2 bg-yellow-500 text-white rounded" disabled={history.length === 0}>
          Undo (Ctrl+Z)
        </button>
        <button onClick={redo} className="p-2 bg-purple-500 text-white rounded" disabled={redoStack.length === 0}>
          Redo (Ctrl+Y)
        </button>
        <button onClick={deleteAnnotation} className="p-2 bg-red-500 text-white rounded" disabled={selectedIds.length === 0}>
          Delete (Del)
        </button>
         <button onClick={handleExport} className="p-2 bg-blue-500 text-white rounded">Export JSON</button>
        <label className="p-2 bg-green-500 text-white rounded cursor-pointer">
          Import JSON
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
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
                  fill={selectedIds.includes(anno.id) ? "red" : "black"}
                  onClick={(e) => handleClick(anno.id, e)}
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
                  stroke={selectedIds.includes(anno.id) ? "red" : "transparent"}
                  strokeWidth={selectedIds.includes(anno.id) ? 2 : 0}
                  onClick={(e) => handleClick(anno.id, e)}
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