import { Stage, Layer, Rect, Text } from "react-konva";
import { useState } from "react";

const AnnotationCanvas = ({ width, height }) => {
  const [annotations, setAnnotations] = useState([]);

  const addText = () => {
    setAnnotations([
      ...annotations,
      { id: annotations.length, type: "text", text: "New Text", x: 50, y: 50 },
    ]);
  };

  const addRectangle = () => {
    setAnnotations([
      ...annotations,
      { id: annotations.length, type: "rect", x: 100, y: 100, width: 100, height: 50, fill: "rgba(0,0,255,0.3)" },
    ]);
  };

  const addTransparentHighlight = () => {
    setAnnotations([
      ...annotations,
      { id: annotations.length, type: "highlight", x: 50, y: 50, width: 150, height: 50, fill: "rgba(255, 255, 0, 0.4)" },
    ]);
  };

  const addOpaqueHighlight = () => {
    setAnnotations([
      ...annotations,
      { id: annotations.length, type: "opaque", x: 50, y: 50, width: 150, height: 50, fill: "rgba(0, 0, 0, 1)" },
    ]);
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <button onClick={addText} className="p-2 bg-blue-500 text-white rounded">Add Text</button>
        <button onClick={addRectangle} className="p-2 bg-green-500 text-white rounded">Add Rectangle</button>
        <button onClick={addTransparentHighlight} className="p-2 bg-yellow-500 text-white rounded">Add Highlight</button>
        <button onClick={addOpaqueHighlight} className="p-2 bg-gray-700 text-white rounded">Add Opaque Mask</button>
      </div>

      <Stage width={width} height={height} className="border shadow-md">
        <Layer>
          {annotations.map((anno) =>
            anno.type === "text" ? (
              <Text key={anno.id} text={anno.text} x={anno.x} y={anno.y} fontSize={16} draggable />
            ) : (
              <Rect
                key={anno.id}
                x={anno.x}
                y={anno.y}
                width={anno.width}
                height={anno.height}
                fill={anno.fill}
                draggable
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;