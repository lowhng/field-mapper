"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowRight,
  Check,
  AlertCircle,
  HelpCircle,
  MoveUp,
  MoveDown,
  GripVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ConnectionLines from "./ConnectionLines";
import { ArrowLeftRight } from "lucide-react";
import ExportPanel from "./ExportPanel";

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
  offsetY?: number; // For manual positioning of connection lines
}

interface MappingInterfaceProps {
  sourceFile?: File;
  targetFile?: File;
  resetToFileUpload?: () => void;
  sourceFields?: string[];
  targetFields?: string[];
  sourceFileName?: string;
  targetFileName?: string;
}

const MappingInterface = ({
  sourceFile,
  targetFile,
  resetToFileUpload,
  sourceFields: initialSourceFields = [],
  targetFields: initialTargetFields = [],
  sourceFileName,
  targetFileName,
}: MappingInterfaceProps) => {
  // Define local onBack function
  const onBack = () => {
    if (resetToFileUpload) {
      resetToFileUpload();
    }
  };
  const [sourceFields, setSourceFields] = useState<Field[]>(
    initialSourceFields.length > 0
      ? initialSourceFields.map((field, index) => ({
          id: `s${index + 1}`,
          name: field,
          type: "string",
        }))
      : [
          { id: "s1", name: "customer_id", type: "string" },
          { id: "s2", name: "first_name", type: "string" },
          { id: "s3", name: "last_name", type: "string" },
          { id: "s4", name: "email", type: "string" },
          { id: "s5", name: "phone_number", type: "string" },
          { id: "s6", name: "address", type: "string" },
          { id: "s7", name: "city", type: "string" },
          { id: "s8", name: "state", type: "string" },
          { id: "s9", name: "zip_code", type: "string" },
        ],
  );

  const [targetFields, setTargetFields] = useState<Field[]>(
    initialTargetFields.length > 0
      ? initialTargetFields.map((field, index) => ({
          id: `t${index + 1}`,
          name: field,
          type: "string",
        }))
      : [
          { id: "t1", name: "id", type: "string" },
          { id: "t2", name: "firstName", type: "string" },
          { id: "t3", name: "lastName", type: "string" },
          { id: "t4", name: "emailAddress", type: "string" },
          { id: "t5", name: "phone", type: "string" },
          { id: "t6", name: "streetAddress", type: "string" },
          { id: "t7", name: "city", type: "string" },
          { id: "t8", name: "state", type: "string" },
          { id: "t9", name: "postalCode", type: "string" },
        ],
  );

  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingField, setDraggingField] = useState<Field | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Generate automatic suggestions based on field name similarity
  useEffect(() => {
    // Function to find similar fields between source and target
    const generateSuggestions = () => {
      // If we already have connections, preserve them
      if (connections.length > 0) {
        return connections;
      }

      const suggestedConnections: Connection[] = [];
      const minLength = Math.min(sourceFields.length, targetFields.length);

      // Create suggestions for fields with similar names or positions
      for (let i = 0; i < minLength; i++) {
        const sourceField = sourceFields[i];
        const targetField = targetFields[i];

        // Simple matching by position
        suggestedConnections.push({
          id: `c${i + 1}`,
          sourceId: sourceField.id,
          targetId: targetField.id,
          status: "suggested",
        });
      }

      return suggestedConnections;
    };

    setConnections(generateSuggestions());
  }, []);

  const [dragType, setDragType] = useState<"connection" | "reorder" | null>(
    null,
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (
    field: Field,
    isSource: boolean,
    type: "connection" | "reorder",
    index?: number,
    e?: React.DragEvent,
  ) => {
    // Always set the dragging field for potential cross-column connections
    setDraggingField({ ...field, matched: isSource });

    // Set the drag type and index for reordering
    setDragType(type);
    if (type === "reorder" && index !== undefined) {
      setDraggedIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    targetField: Field,
    isSource: boolean,
    dropIndex?: number,
  ) => {
    // If we have a dragging field and we're dropping on the opposite side
    if (draggingField && draggingField.matched !== isSource) {
      // Create connection between source and target
      const sourceId = draggingField.matched
        ? draggingField.id
        : targetField.id;
      const targetId = draggingField.matched
        ? targetField.id
        : draggingField.id;

      // Check if connection already exists
      const existingConnection = connections.find(
        (conn) => conn.sourceId === sourceId && conn.targetId === targetId,
      );

      if (!existingConnection) {
        const newConnection: Connection = {
          id: `c${Date.now()}`,
          sourceId,
          targetId,
          status: "manual",
        };

        setConnections([...connections, newConnection]);
      }

      setDraggingField(null);
      setDragType(null);
      return;
    }

    // Handle field reordering within the same side
    if (
      dragType === "reorder" &&
      draggedIndex !== null &&
      dropIndex !== undefined &&
      draggingField?.matched === isSource
    ) {
      const fields = isSource ? sourceFields : targetFields;
      const setFields = isSource ? setSourceFields : setTargetFields;

      // Don't do anything if dropping on the same index
      if (draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragType(null);
        return;
      }

      const newFields = [...fields];
      const [movedField] = newFields.splice(draggedIndex, 1);
      newFields.splice(dropIndex, 0, movedField);

      // Update the fields array
      setFields(newFields);
    }

    setDraggingField(null);
    setDragType(null);
  };

  const handleAcceptSuggestion = (connection: Connection) => {
    setConnections(
      connections.map((conn) =>
        conn.id === connection.id ? { ...conn, status: "matched" } : conn,
      ),
    );
  };

  const handleRemoveConnection = (connectionId: string) => {
    setConnections(connections.filter((conn) => conn.id !== connectionId));
  };

  const handleAcceptAllSuggestions = () => {
    setConnections(
      connections.map((conn) =>
        conn.status === "suggested" ? { ...conn, status: "matched" } : conn,
      ),
    );
  };

  const getConnectionStatus = (fieldId: string, isSource: boolean) => {
    const connection = connections.find((conn) =>
      isSource ? conn.sourceId === fieldId : conn.targetId === fieldId,
    );

    return connection ? connection.status : undefined;
  };

  const handleFieldReorder = (
    fieldId: string,
    direction: "up" | "down",
    isSource: boolean,
  ) => {
    const fields = isSource ? sourceFields : targetFields;
    const setFields = isSource ? setSourceFields : setTargetFields;

    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const newFields = [...fields];

    if (direction === "up" && index > 0) {
      // Swap with the field above
      [newFields[index], newFields[index - 1]] = [
        newFields[index - 1],
        newFields[index],
      ];
      setFields(newFields);
    } else if (direction === "down" && index < fields.length - 1) {
      // Swap with the field below
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];
      setFields(newFields);
    }
  };

  const renderField = (field: Field, isSource: boolean, index: number) => {
    const status = getConnectionStatus(field.id, isSource);
    let statusClass = "";
    let statusIcon = null;

    if (status === "matched") {
      statusClass = "border-green-500";
      statusIcon = <Check className="h-4 w-4 text-green-500" />;
    } else if (status === "suggested") {
      statusClass = "border-yellow-500";
      statusIcon = <HelpCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      statusClass = "border-gray-300";
      statusIcon = <AlertCircle className="h-4 w-4 text-gray-400" />;
    }

    return (
      <div
        key={field.id}
        data-field-id={field.id}
        data-index={index}
        draggable
        onDragStart={(e) => {
          // Set drag data for field reordering
          e.dataTransfer.setData("text/plain", index.toString());
          e.dataTransfer.effectAllowed = "move";
          handleDragStart(field, isSource, "reorder", index, e);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("bg-gray-100");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("bg-gray-100");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("bg-gray-100");
          handleDrop(field, isSource, index);
        }}
        className={`flex items-center justify-between p-3 mb-2 border-2 rounded-md ${statusClass} hover:bg-gray-50 group cursor-move`}
      >
        <div className="flex items-center">
          <div className="flex items-center mr-2 text-gray-400">
            <GripVertical size={16} className="cursor-grab" />
          </div>
          <div>
            <span className="text-sm font-medium">{field.name}</span>
            <span className="ml-2 text-xs text-gray-500">({field.type})</span>
          </div>
        </div>
        <div className="flex items-center">{statusIcon}</div>
      </div>
    );
  };

  return (
    <div className="bg-white w-full h-full p-4 md:p-8 max-w-7xl mx-auto rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Field Mapping Interface</h2>
          <p className="text-gray-500">
            {sourceFileName || sourceFile?.name || "Source file"} →{" "}
            {targetFileName || targetFile?.name || "Target file"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onBack}>
            Back to Upload
          </Button>
          <Button onClick={() => setShowExportPanel(true)}>
            Export Mapping
          </Button>
        </div>
      </div>

      <Tabs defaultValue="mapping">
        <TabsList className="mb-4">
          <TabsTrigger value="mapping">Mapping</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-4">
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-sm">Mapped</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fields that have been successfully mapped</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-sm">Suggested</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fields with suggested mappings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
                      <span className="text-sm">Unmapped</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fields that have not been mapped yet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAllSuggestions}
                className="text-sm"
              >
                Accept All Suggestions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConnections(
                    connections.filter((conn) => conn.status !== "suggested"),
                  );
                }}
                className="text-sm"
              >
                Clear Suggestions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConnections([])}
                className="text-sm text-destructive hover:text-destructive"
              >
                Clear All Mappings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 relative mapping-container">
            <Card className="col-span-5">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Source Fields</h3>
                <div className="space-y-2">
                  {sourceFields.map((field, index) =>
                    renderField(field, true, index),
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="col-span-2 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-4">
                <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                <span className="ml-2 text-sm font-medium">
                  Drag fields across columns to connect
                </span>
              </div>
              <ConnectionLines
                connections={connections}
                sourceFields={sourceFields}
                targetFields={targetFields}
                onAcceptSuggestion={handleAcceptSuggestion}
                onRemoveConnection={handleRemoveConnection}
                onUpdateConnectionOffset={(connectionId, offsetY) => {
                  setConnections((prev) =>
                    prev.map((conn) =>
                      conn.id === connectionId ? { ...conn, offsetY } : conn,
                    ),
                  );
                }}
              />
            </div>

            <Card className="col-span-5">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Target Fields</h3>
                <div className="space-y-2">
                  {targetFields.map((field, index) =>
                    renderField(field, false, index),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
              <p className="text-gray-500">
                Preview of how your data will be mapped.
              </p>

              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {connections.map((conn) => {
                      const sourceField = sourceFields.find(
                        (f) => f.id === conn.sourceId,
                      );
                      const targetField = targetFields.find(
                        (f) => f.id === conn.targetId,
                      );
                      return (
                        <tr key={conn.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sourceField?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {targetField?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {conn.status === "matched" && (
                              <span className="text-green-500">Mapped</span>
                            )}
                            {conn.status === "suggested" && (
                              <span className="text-yellow-500">Suggested</span>
                            )}
                            {conn.status === "manual" && (
                              <span className="text-blue-500">Manual</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showExportPanel && (
        <ExportPanel
          connections={connections}
          sourceFields={sourceFields}
          targetFields={targetFields}
          onClose={() => setShowExportPanel(false)}
        />
      )}

      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Made with love by Wei Hong.</p>
        <p>© {new Date().getFullYear()} All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default MappingInterface;
