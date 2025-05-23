"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Download, Image, FileJson } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ExportPanelProps {
  onExport?: (format: string) => void;
  isExportEnabled?: boolean;
  connections?: any[];
  sourceFields?: any[];
  targetFields?: any[];
  onClose?: () => void;
}

const ExportPanel = ({
  onExport = () => {},
  isExportEnabled = true,
  connections = [],
  sourceFields = [],
  targetFields = [],
  onClose = () => {},
}: ExportPanelProps) => {
  const [exportFormat, setExportFormat] = useState<string>("image");

  const handleExport = () => {
    // Prepare the export data based on the format
    const exportData = {
      connections: connections.map((conn) => {
        const sourceField = sourceFields.find((f) => f.id === conn.sourceId);
        const targetField = targetFields.find((f) => f.id === conn.targetId);
        return {
          source: sourceField?.name || conn.sourceId,
          target: targetField?.name || conn.targetId,
          status: conn.status,
        };
      }),
      format: exportFormat,
    };

    // Call the export function with the data
    onExport(exportFormat);

    // For demo purposes, we'll also log the data
    console.log("Exporting mapping data:", exportData);

    if (exportFormat === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "field-mapping.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === "csv") {
      // Create CSV content
      let csvContent = "Source Field,Target Field,Status\n";
      exportData.connections.forEach((conn) => {
        csvContent += `"${conn.source}","${conn.target}","${conn.status}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "field-mapping.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === "image") {
      // For image export, use a simpler approach with html2canvas
      // that works better with Next.js and Vercel deployment
      const captureScreenshot = () => {
        // Use a regular import to avoid dynamic import issues with Vercel
        const html2canvasPromise = import("html2canvas")
          .then((module) => {
            const html2canvas = module.default;
            const mappingContainer =
              document.querySelector(".mapping-container");

            if (!mappingContainer) {
              throw new Error("Mapping container not found for screenshot");
            }

            const containerElement = mappingContainer as HTMLElement;
            const originalBackground = containerElement.style.background;
            containerElement.style.background = "white";

            return html2canvas(containerElement, {
              backgroundColor: "#ffffff",
              useCORS: true,
              scale: 2,
            });
          })
          .then((canvas) => {
            const mappingContainer =
              document.querySelector(".mapping-container");
            if (mappingContainer) {
              const containerElement = mappingContainer as HTMLElement;
              containerElement.style.background =
                containerElement.dataset.originalBackground || "";
            }

            return new Promise<Blob | null>((resolve) => {
              canvas.toBlob((blob) => resolve(blob), "image/png");
            });
          })
          .then((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "field-mapping.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          })
          .catch((err) => {
            console.error("Error capturing screenshot:", err);
            alert("Could not export as image. Please try another format.");
          });
      };

      captureScreenshot();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Mapping
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="export-format" className="text-sm font-medium">
              Export Format
            </label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger id="export-format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Image (.png)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>JSON (.json)</span>
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>CSV (.csv)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={handleExport}
                      disabled={!isExportEnabled}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isExportEnabled && (
                  <TooltipContent>
                    <p>Complete the field mapping to enable export</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPanel;
