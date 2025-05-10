/**
 * Parse CSV file and extract headers and data
 */
export async function parseCSVFile(
  file: File,
): Promise<{ headers: string[]; data: string[][] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file");
        }

        const csvText = event.target.result as string;
        const lines = csvText
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");

        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }

        // Extract headers from the first line
        const headers = parseCSVLine(lines[0]);

        // Extract data from remaining lines
        const data = lines.slice(1).map((line) => parseCSVLine(line));

        resolve({ headers, data });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      // Add character to current field
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}
