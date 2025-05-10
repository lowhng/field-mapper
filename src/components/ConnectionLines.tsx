"use client";

import React, { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Field {
  id: string;
  name: string;
  type: string;
  matched?: boolean;
  suggested?: boolean;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  status: "matched" | "suggested" | "manual";
  // Allow for manual positioning of connection lines
  offsetY?: number;
}

interface ConnectionLinesProps {
  connections: Connection[];
  sourceFields: Field[];
  targetFields: Field[];
  onAcceptSuggestion: (connection: Connection) => void;
  onRemoveConnection: (connectionId: string) => void;
  onUpdateConnectionOffset: (connectionId: string, offsetY: number) => void;
}

const ConnectionLines = ({
  connections,
  sourceFields,
  targetFields,
  onAcceptSuggestion,
  onRemoveConnection,
  onUpdateConnectionOffset,
}: ConnectionLinesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingConnection, setDraggingConnection] = useState<string | null>(
    null,
  );
  const [startDragY, setStartDragY] = useState<number>(0);

  // Function to get the position of a field element by its ID
  const getFieldPosition = (fieldId: string, isSource: boolean) => {
    const selector = `[data-field-id="${fieldId}"]`;
    const fieldElement = document.querySelector(selector);

    if (!fieldElement || !containerRef.current) return null;

    const fieldRect = fieldElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return {
      x: isSource
        ? fieldRect.right - containerRect.left
        : fieldRect.left - containerRect.left,
      y: fieldRect.top + fieldRect.height / 2 - containerRect.top,
      width: fieldRect.width,
      height: fieldRect.height,
    };
  };

  const handleDragStart = (e: React.MouseEvent, connectionId: string) => {
    setDraggingConnection(connectionId);
    setStartDragY(e.clientY);
    e.stopPropagation();
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggingConnection) return;

    const deltaY = e.clientY - startDragY;
    const connection = connections.find((c) => c.id === draggingConnection);
    if (connection) {
      const currentOffset = connection.offsetY || 0;
      onUpdateConnectionOffset(draggingConnection, currentOffset + deltaY);
      setStartDragY(e.clientY);
    }
  };

  const handleDragEnd = () => {
    setDraggingConnection(null);
  };

  useEffect(() => {
    if (draggingConnection) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [draggingConnection, startDragY]);

  // Determine the color based on the connection status
  const getStatusColor = (status: "matched" | "suggested" | "manual") => {
    switch (status) {
      case "matched":
        return "stroke-green-500";
      case "suggested":
        return "stroke-yellow-500";
      case "manual":
        return "stroke-blue-500";
      default:
        return "stroke-gray-300";
    }
  };

  const getStatusBgColor = (status: "matched" | "suggested" | "manual") => {
    switch (status) {
      case "matched":
        return "bg-green-500";
      case "suggested":
        return "bg-yellow-500";
      case "manual":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
        {connections.map((connection) => {
          const sourcePos = getFieldPosition(connection.sourceId, true);
          const targetPos = getFieldPosition(connection.targetId, false);

          if (!sourcePos || !targetPos) return null;

          const offsetY = connection.offsetY || 0;

          // Calculate control points for the bezier curve
          // Extend the lines all the way to the field edges
          const sourceX = sourcePos.x; // Extend further past the right edge of source field
          const sourceY = sourcePos.y + offsetY;
          const targetX = targetPos.x; // Extend further past the left edge of target field
          const targetY = targetPos.y + offsetY;

          // Control points at 1/3 and 2/3 of the distance
          const controlPoint1X = sourceX + (targetX - sourceX) / 3;
          const controlPoint1Y = sourceY;
          const controlPoint2X = sourceX + (2 * (targetX - sourceX)) / 3;
          const controlPoint2Y = targetY;

          const path = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;

          return (
            <g key={connection.id}>
              <path
                d={path}
                fill="none"
                className={cn(
                  "stroke-[2px]",
                  getStatusColor(connection.status),
                )}
                strokeDasharray={connection.status === "suggested" ? "5,5" : ""}
              />

              {/* Draggable handle in the middle of the curve */}
              <circle
                cx={(sourceX + targetX) / 2}
                cy={(sourceY + targetY) / 2}
                r="5"
                className={cn(
                  getStatusBgColor(connection.status),
                  "cursor-move",
                )}
                onMouseDown={(e) => handleDragStart(e, connection.id)}
                style={{ pointerEvents: "all" }}
              />

              {/* Status indicator - clickable for suggested connections */}
              {connection.status === "suggested" && (
                <g
                  transform={`translate(${(sourceX + targetX) / 2 - 6}, ${(sourceY + targetY) / 2 - 6})`}
                  style={{ pointerEvents: "all" }}
                  onClick={() => onAcceptSuggestion(connection)}
                >
                  <circle cx="6" cy="6" r="6" className="fill-yellow-500" />
                  <text
                    x="6"
                    y="9"
                    textAnchor="middle"
                    className="text-white text-xs font-bold"
                    style={{ pointerEvents: "none" }}
                  >
                    ?
                  </text>
                </g>
              )}

              {/* Delete button */}
              <g
                transform={`translate(${(sourceX + targetX) / 2 + 15}, ${(sourceY + targetY) / 2 - 7})`}
                className="opacity-0 hover:opacity-100 transition-opacity"
                style={{ pointerEvents: "all" }}
                onClick={() => onRemoveConnection(connection.id)}
              >
                <circle cx="7" cy="7" r="7" className="fill-red-100" />
                <line
                  x1="4"
                  y1="4"
                  x2="10"
                  y2="10"
                  className="stroke-red-500 stroke-[1.5px]"
                />
                <line
                  x1="10"
                  y1="4"
                  x2="4"
                  y2="10"
                  className="stroke-red-500 stroke-[1.5px]"
                />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ConnectionLines;
