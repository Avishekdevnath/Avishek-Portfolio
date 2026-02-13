import * as XLSX from 'xlsx';

export interface CsvRow {
  [key: string]: string | undefined;
}

export interface CsvError {
  row: number;
  field?: string;
  message: string;
}

export interface ParseResult {
  rows: CsvRow[];
  headers: string[];
  errors: string[];
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-\s]+/g, '');
}

function isXlsxContent(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x50 && bytes[1] === 0x4B;
}

export function parseCsv(csvData: string | ArrayBuffer): ParseResult {
  const errors: string[] = [];
  let rows: CsvRow[] = [];
  let headers: string[] = [];

  try {
    if (typeof csvData === 'string') {
      if (csvData.startsWith('UEsDBBQAAAAI')) {
        const buffer = Buffer.from(csvData, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (rows.length > 0) {
          headers = Object.keys(rows[0] as object);
        }
      } else {
        try {
          const buffer = Buffer.from(csvData, 'base64');
          if (buffer.length >= 4 && isXlsxContent(buffer.buffer)) {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            if (rows.length > 0) {
              headers = Object.keys(rows[0] as object);
            }
          } else {
            const workbook = XLSX.read(csvData, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            if (rows.length > 0) {
              headers = Object.keys(rows[0] as object);
            }
          }
        } catch {
          const workbook = XLSX.read(csvData, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          if (rows.length > 0) {
            headers = Object.keys(rows[0] as object);
          }
        }
      }
    } else {
      if (isXlsxContent(csvData)) {
        const workbook = XLSX.read(csvData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (rows.length > 0) {
          headers = Object.keys(rows[0] as object);
        }
      } else {
        const workbook = XLSX.read(csvData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (rows.length > 0) {
          headers = Object.keys(rows[0] as object);
        }
      }
    }

    if (rows.length > 0 && headers.length > 0) {
      const normalizedRows: CsvRow[] = rows.map((row) => {
        const normalizedRow: CsvRow = {};
        for (const [key, value] of Object.entries(row as object)) {
          normalizedRow[normalizeHeader(key)] = value;
        }
        return normalizedRow;
      });
      rows = normalizedRows;
      headers = headers.map(normalizeHeader);
    }
  } catch {
    errors.push('Failed to parse file');
  }

  return { rows, headers, errors };
}

export function getFieldValue(row: CsvRow, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    const normalizedField = normalizeHeader(fieldName);
    if (row[normalizedField] !== undefined) {
      const value = row[normalizedField];
      return typeof value === 'string' ? value : String(value || '');
    }
  }
  return undefined;
}

export function validateRow(
  row: CsvRow,
  validators: Array<{
    field: string;
    required?: boolean;
    maxLength?: number;
    custom?: (value: string) => string | null;
  }>,
  rowNumber: number
): CsvError[] {
  const errors: CsvError[] = [];

  for (const validator of validators) {
    const value = getFieldValue(row, [validator.field]);

    if (validator.required && (!value || !value.trim())) {
      errors.push({
        row: rowNumber,
        field: validator.field,
        message: `${validator.field} is required`,
      });
      continue;
    }

    if (value && validator.maxLength && value.length > validator.maxLength) {
      errors.push({
        row: rowNumber,
        field: validator.field,
        message: `${validator.field} exceeds maximum length of ${validator.maxLength}`,
      });
    }

    if (value && validator.custom) {
      const customError = validator.custom(value);
      if (customError) {
        errors.push({
          row: rowNumber,
          field: validator.field,
          message: customError,
        });
      }
    }
  }

  return errors;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return true;
  
  // Trim whitespace
  const trimmed = url.trim();
  
  // If it doesn't have a protocol, try adding one
  let urlToCheck = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    urlToCheck = 'https://' + trimmed;
  }
  
  try {
    new URL(urlToCheck);
    return true;
  } catch {
    return false;
  }
}

export function toCsv<T extends Record<string, unknown>>(
  data: T[],
  _headers: string[]
): string {
  const worksheet = XLSX.utils.json_to_sheet(data as object[]);
  return XLSX.utils.sheet_to_csv(worksheet);
}

export function generateTemplateCsv(headers: string[], sampleData?: Record<string, string>): string {
  const data = sampleData ? [sampleData] : [{}];
  return toCsv(data, headers);
}
