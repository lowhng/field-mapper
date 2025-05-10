"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Upload, FileX, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface FileUploadSectionProps {
  onFilesUploaded?: (sourceFile: File, targetFile: File) => void;
}

const FileUploadSection = ({
  onFilesUploaded = () => {},
}: FileUploadSectionProps) => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{
    source: boolean;
    target: boolean;
  }>({ source: false, target: false });

  const validateFile = (file: File): boolean => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload CSV or Excel files only.`);
      return false;
    }

    // Reset error if valid
    setError(null);
    return true;
  };

  const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSourceFile(file);
      }
    }
  };

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setTargetFile(file);
      }
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    type: "source" | "target",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    type: "source" | "target",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: "source" | "target",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        if (type === "source") {
          setSourceFile(file);
        } else {
          setTargetFile(file);
        }
      }
    }
  };

  const handleProceed = () => {
    if (sourceFile && targetFile) {
      onFilesUploaded(sourceFile, targetFile);
    } else {
      setError("Please upload both source and target files before proceeding.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Files</h2>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Source File Upload */}
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="p-0">
            <div
              className={`flex flex-col items-center justify-center h-64 p-6 ${dragOver.source ? "bg-primary/5" : ""}`}
              onDragOver={(e) => handleDragOver(e, "source")}
              onDragLeave={(e) => handleDragLeave(e, "source")}
              onDrop={(e) => handleDrop(e, "source")}
            >
              {sourceFile ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-lg">File Uploaded</p>
                  <p className="text-muted-foreground mb-2">
                    {sourceFile.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSourceFile(null)}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="font-medium text-lg">Source File</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Drag & drop your CSV or Excel file here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="sourceFile"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleSourceFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("sourceFile")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Target File Upload */}
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <CardContent className="p-0">
            <div
              className={`flex flex-col items-center justify-center h-64 p-6 ${dragOver.target ? "bg-primary/5" : ""}`}
              onDragOver={(e) => handleDragOver(e, "target")}
              onDragLeave={(e) => handleDragLeave(e, "target")}
              onDrop={(e) => handleDrop(e, "target")}
            >
              {targetFile ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-lg">File Uploaded</p>
                  <p className="text-muted-foreground mb-2">
                    {targetFile.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTargetFile(null)}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="font-medium text-lg">Target File</p>
                  <p className="text-muted-foreground text-center mb-4">
                    Drag & drop your CSV or Excel file here, or click to browse
                  </p>
                  <input
                    type="file"
                    id="targetFile"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleTargetFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("targetFile")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={handleProceed}
          disabled={!sourceFile || !targetFile}
        >
          Proceed to Mapping
        </Button>
      </div>
    </div>
  );
};

export default FileUploadSection;
