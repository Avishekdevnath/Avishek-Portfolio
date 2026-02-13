"use client";

import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";

interface CsvRow {
  [key: string]: string | undefined;
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  total: number;
  errors: { row: number; field?: string; message: string }[];
  validationErrors: { row: number; field?: string; message: string }[];
}

interface BulkImportPageProps {
  title: string;
  description: string;
  apiEndpoint: string;
  requiredFields: { key: string; label: string }[];
  optionalFields: { key: string; label: string }[];
  exampleCsv: string;
}

interface ColumnMapping {
  [csvColumn: string]: string; // csvColumn -> expectedFieldKey
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-\s]+/g, "");
}

export default function BulkImportPage({
  title,
  description,
  apiEndpoint,
  requiredFields,
  optionalFields,
  exampleCsv,
}: BulkImportPageProps) {
  const [csvText, setCsvText] = useState("");
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [mappedHeaders, setMappedHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allFields = [...requiredFields, ...optionalFields];

  // Auto-map columns based on similarity
  const autoMapColumns = useCallback((detectedColumns: string[]) => {
    const mapping: ColumnMapping = {};

    // Normalize detected columns and create mapping using normalized names
    for (const col of detectedColumns) {
      const normalized = normalizeHeader(col);
      
      // Try to find a matching field
      for (const field of allFields) {
        const fieldNormalized = normalizeHeader(field.key);
        
        // Direct match using normalized names
        if (normalized === fieldNormalized) {
          mapping[normalized] = field.key;
          break;
        }
        
        // Check for partial match
        if (normalized.includes(fieldNormalized) || fieldNormalized.includes(normalized)) {
          const existingMapping = Object.values(mapping).find(m => m === field.key);
          if (!existingMapping) {
            mapping[normalized] = field.key;
            break;
          }
        }
        
        // Common variations mapping
        const variations: Record<string, string[]> = {
          careerpageurl: ['careerpage', 'career_page', 'careerpageurl', 'career', 'careers', 'careerspage'],
          website: ['website', 'websiteurl', 'companywebsite', 'company_url', 'site'],
          companyname: ['companyname', 'company_name', 'company', 'name'],
          country: ['country', 'countryname', 'country_name', 'nation'],
          tags: ['tags', 'taglist', 'tag_list', 'keywords', 'categories'],
          notes: ['notes', 'description', 'companynotes', 'comments', 'info'],
        };

        for (const [fieldKey, vars] of Object.entries(variations)) {
          if (vars.includes(normalized) && normalized.length > 2) {
            mapping[normalized] = fieldKey;
            break;
          }
        }
      }
    }

    setColumnMapping(mapping);
    updateMappedHeaders(detectedColumns, mapping);
  }, [allFields]);

  const updateMappedHeaders = (detected: string[], mapping: ColumnMapping) => {
    const mapped = detected.map(col => {
      const normalized = normalizeHeader(col);
      const mappedField = mapping[normalized];
      if (mappedField) {
        return `${col} → ${mappedField}`;
      }
      return `${col} (unmapped)`;
    });
    setMappedHeaders(mapped);
  };

  const handleFile = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    const isCsv = file.type === "text/csv" || fileName.endsWith(".csv");
    const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileName.endsWith(".xlsx");

    if (!isCsv && !isXlsx) {
      setError("Please upload a CSV or XLSX file");
      return;
    }

    const reader = new FileReader();

    if (isXlsx || file.type.includes("spreadsheet")) {
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as object[];
          
          if (jsonData.length === 0) {
            setError("XLSX file is empty");
            return;
          }

          const rawCols = Object.keys(jsonData[0] as object);
          setRawHeaders(rawCols);

          const rows: CsvRow[] = jsonData.slice(0, 5).map((row) => {
            const csvRow: CsvRow = {};
            for (const [key, value] of Object.entries(row as object)) {
              csvRow[key] = String(value || "");
            }
            return csvRow;
          });

          // Convert full data to CSV format for API
          const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
          setCsvText(csvOutput);
          setParsedData(rows);
          setError(null);
          
          // Auto-map columns
          autoMapColumns(rawCols);
        } catch (err) {
          setError("Failed to parse XLSX file");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
        parseAndPreview(text);
      };
      reader.readAsText(file);
    }
  }, [autoMapColumns]);

  const parseAndPreview = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      setError("File must have at least a header row and one data row");
      setParsedData([]);
      setRawHeaders([]);
      setMappedHeaders([]);
      return;
    }

    // Parse headers from first line
    const firstLine = lines[0];
    const rawCols = parseCsvLine(firstLine).map(h => h.replace(/"/g, "").trim());
    setRawHeaders(rawCols);

    // Parse preview rows
    const rows: CsvRow[] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const values = parseCsvLine(lines[i]);
      const row: CsvRow = {};
      rawCols.forEach((header, j) => {
        row[header] = values[j]?.trim().replace(/"/g, "") || "";
      });
      rows.push(row);
    }
    setParsedData(rows);
    setError(null);

    // Auto-map columns
    autoMapColumns(rawCols);
  };

  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    parseAndPreview(text);
  };

  const handleMappingChange = (normalizedCol: string, fieldKey: string) => {
    const newMapping = { ...columnMapping };
    if (fieldKey === "") {
      delete newMapping[normalizedCol];
    } else {
      newMapping[normalizedCol] = fieldKey;
    }
    setColumnMapping(newMapping);
    updateMappedHeaders(rawHeaders, newMapping);
  };

  const handleSubmit = async () => {
    if (!csvText.trim()) {
      setError("Please upload or paste data");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          csvData: csvText,
          columnMapping 
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Import failed");
        if (data.errors) {
          setResult({ imported: 0, updated: 0, skipped: 0, total: 0, errors: data.errors, validationErrors: data.validationErrors || [] });
        }
      } else {
        setResult(data.data);
      }
    } catch {
      setError("Failed to import. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [...requiredFields.map((f) => f.label), ...optionalFields.map((f) => f.label)];
    const csv = headers.join(",");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setCsvText(exampleCsv);
    parseAndPreview(exampleCsv);
  };

  const remapData = (): CsvRow[] => {
    // Remap parsed data using column mapping
    return parsedData.map(row => {
      const newRow: CsvRow = {};
      Object.entries(row).forEach(([col, val]) => {
        const normalized = normalizeHeader(col);
        const fieldKey = columnMapping[normalized];
        if (fieldKey) {
          newRow[fieldKey] = val;
        } else {
          newRow[col] = val;
        }
      });
      return newRow;
    });
  };

  const displayData = Object.keys(columnMapping).length > 0 ? remapData() : parsedData;
  const displayHeaders = Object.keys(columnMapping).length > 0 
    ? Object.values(columnMapping)
    : rawHeaders;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Instructions</h2>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Upload a CSV or XLSX file or paste data</li>
              <li>First row must be column headers</li>
              <li>Required fields: {requiredFields.map((f) => f.label).join(", ")}</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Download Template
              </button>
              <button
                onClick={loadExample}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Load Example
              </button>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Click to upload
            </button>
            <p className="text-sm text-gray-500 mt-1">or drag and drop CSV/XLSX file</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className={`border rounded-lg p-4 ${result.imported > 0 || result.updated > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
              <h3 className="font-semibold">Import Complete</h3>
              <p className="text-sm mt-1">
                Imported: {result.imported} | Updated: {result.updated} | Skipped: {result.skipped} | Total: {result.total}
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...and {result.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              {result.validationErrors && result.validationErrors.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Validation Errors:</p>
                  <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                    {result.validationErrors.slice(0, 10).map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                    {result.validationErrors.length > 10 && (
                      <li>...and {result.validationErrors.length - 10} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Data</h2>
            <textarea
              value={csvText}
              onChange={handleChange}
              placeholder="Paste your CSV data here or upload a file..."
              className="w-full h-48 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !csvText.trim()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import Data"}
            </button>
          </div>

          {parsedData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Preview (first 5 rows)</h2>
                <button
                  onClick={() => setShowMapping(!showMapping)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showMapping ? "Hide Mapping" : "Map Columns"}
                </button>
              </div>

              {/* Column Mapping Interface */}
              {showMapping && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Map Your Columns to Expected Fields</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Match your CSV columns to the fields the system expects. Auto-mapping is applied automatically.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rawHeaders.map((col) => {
                      const normalized = normalizeHeader(col);
                      return (
                        <div key={col} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 w-1/3 truncate" title={col}>
                            {col}
                          </span>
                          <span className="text-gray-400">→</span>
                          <select
                            value={columnMapping[normalized] || ""}
                            onChange={(e) => handleMappingChange(normalized, e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">-- Not mapped --</option>
                            {allFields.map((field) => (
                              <option key={field.key} value={field.key}>
                                {field.label} ({field.key})
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">#</th>
                      {displayHeaders.map((h) => (
                        <th key={h} className="py-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((row, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                        {displayHeaders.map((h) => (
                          <td key={h} className="py-2 pr-4">
                            {row[h] || row[normalizeHeader(h)] || <span className="text-gray-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
