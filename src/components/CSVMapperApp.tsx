"use client";

import { useState } from "react";
import FileUploadSection from "@/components/FileUploadSection";
import MappingInterface from "@/components/MappingInterface";
import { parseCSVFile } from "@/lib/csvParser";

export default function CSVMapperApp() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [targetFields, setTargetFields] = useState<string[]>([]);
  const [isFilesUploaded, setIsFilesUploaded] = useState(false);
  const [mappingKey, setMappingKey] = useState<number>(0); // Add a key to force re-render

  // Parse CSV/Excel files and extract field names
  const parseFile = async (file: File): Promise<string[]> => {
    try {
      // For CSV files
      if (file.name.endsWith(".csv")) {
        const { headers } = await parseCSVFile(file);
        return headers;
      }
      // For Excel files (.xlsx, .xls)
      else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // Excel parsing would require a library like SheetJS/xlsx
        // For now, we'll return a placeholder message
        return [`Excel parsing not implemented yet (${file.name})`];
      }
      // Fallback for unsupported file types
      else {
        throw new Error(`Unsupported file type: ${file.name}`);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      return [`Error: Could not parse ${file.name}`];
    }
  };

  const handleFilesUploaded = async (source: File, target: File) => {
    setSourceFile(source);
    setTargetFile(target);

    try {
      const sourceFieldsData = await parseFile(source);
      const targetFieldsData = await parseFile(target);

      setSourceFields(sourceFieldsData);
      setTargetFields(targetFieldsData);
      setIsFilesUploaded(true);
    } catch (error) {
      console.error("Error parsing files:", error);
      // In a real app, we would show an error message to the user
    }
  };

  const handleReset = () => {
    setIsFilesUploaded(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 pt-24 bg-background">
      <header className="w-full max-w-7xl mb-8">
        <h1 className="text-3xl font-bold text-center">
          CSV/Excel Field Mapper
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Upload two files and map fields between them using drag and drop
        </p>
      </header>

      {!isFilesUploaded ? (
        <>
          <FileUploadSection onFilesUploaded={handleFilesUploaded} />
          <footer className="w-full max-w-7xl mt-auto pt-6 text-center text-sm text-muted-foreground">
            <p>Made with love by Wei Hong.</p>
            <p>© {new Date().getFullYear()} All Rights Reserved.</p>
          </footer>
        </>
      ) : (
        <MappingInterface
          key={mappingKey}
          sourceFields={sourceFields}
          targetFields={targetFields}
          sourceFileName={sourceFile?.name || "Source File"}
          targetFileName={targetFile?.name || "Target File"}
          resetToFileUpload={handleReset}
        />
      )}
    </main>
  );
}
