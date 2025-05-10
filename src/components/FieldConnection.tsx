"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  status: "matched" | "suggested" | "manual";
}

interface FieldConnectionProps {
  connection: Connection;
  sourceFields: { id: string; name: string }[];
  targetFields: { id: string; name: string }[];
  onAccept?: () => void;
  onRemove?: () => void;
}

const FieldConnection = ({
  connection,
  sourceFields,
  targetFields,
  onAccept,
  onRemove,
}: FieldConnectionProps) => {
  // Find the source and target field names
  if (!Array.isArray(sourceFields) || !Array.isArray(targetFields)) {
    console.warn(
      "FieldConnection received undefined sourceFields or targetFields",
    );
    return null;
  }

  const sourceField = sourceFields.find((f) => f.id === connection.sourceId);
  const targetField = targetFields.find((f) => f.id === connection.targetId);

  if (!sourceField || !targetField) return null;

  // Determine the color based on the connection status
  const getStatusColor = () => {
    switch (connection.status) {
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

  const getStatusBgColor = () => {
    switch (connection.status) {
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
    <div className="relative group">
      {/* SVG line connecting the fields */}
      <svg className="absolute left-0 top-0 w-full h-10 overflow-visible pointer-events-none">
        <line
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
          className={cn("stroke-[2px]", getStatusColor())}
          strokeDasharray={connection.status === "suggested" ? "5,5" : ""}
        />
      </svg>

      {/* Status indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full",
            getStatusBgColor(),
            connection.status === "suggested" ? "cursor-pointer" : "",
          )}
          onClick={connection.status === "suggested" ? onAccept : undefined}
          title={
            connection.status === "suggested"
              ? "Click to accept suggestion"
              : undefined
          }
        >
          {connection.status === "suggested" && (
            <span className="text-white text-xs">?</span>
          )}
        </div>
      </div>

      {/* Delete button - only visible on hover */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove connection"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default FieldConnection;
