import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachCompany from '@/models/OutreachCompany';
import { ensureDashboardAuth } from '../../_auth';
import {
  parseCsv,
  validateRow,
  isValidUrl,
  CsvRow,
  CsvError,
} from '@/lib/csv-parser';

interface ColumnMapping {
  [csvColumn: string]: string;
}

interface BulkCompanyRow extends CsvRow {
  companyname?: string;
  country?: string;
  website?: string;
  careerpageurl?: string;
  tags?: string;
  notes?: string;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_\-\s]+/g, '');
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { csvData, columnMapping } = body;

    console.log('Bulk import received:', { csvDataLength: csvData?.length, columnMapping });

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { success: false, error: 'CSV data is required' },
        { status: 400 }
      );
    }

    // Parse CSV
    const parseResult = parseCsv(csvData);
    console.log('Parsed CSV:', { headers: parseResult.headers, rowCount: parseResult.rows.length });
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse CSV',
        details: parseResult.errors,
      }, { status: 400 });
    }

    // Apply column mapping if provided
    // Handle both raw column names and normalized versions
    let rows: CsvRow[] = parseResult.rows;
    if (columnMapping && typeof columnMapping === 'object') {
      console.log('Applying column mapping:', columnMapping);
      
      // Build a reverse mapping: normalized name -> target field
      const normalizedToTarget: Record<string, string> = {};
      for (const [csvCol, targetField] of Object.entries(columnMapping)) {
        const normalized = normalizeHeader(csvCol);
        normalizedToTarget[normalized] = targetField as string;
      }
      console.log('Normalized mapping:', normalizedToTarget);
      
      rows = rows.map((row) => {
        const mappedRow: CsvRow = {};
        for (const [csvCol, value] of Object.entries(row)) {
          // Try exact match first
          let mappedField = (columnMapping as Record<string, string>)[csvCol];
          
          // If no exact match, try normalized version
          if (!mappedField) {
            const normalized = normalizeHeader(csvCol);
            mappedField = normalizedToTarget[normalized];
          }
          
          // Fallback: common variations
          if (!mappedField) {
            const normalized = normalizeHeader(csvCol);
            if (normalized === 'careerpage' || normalized.includes('career')) {
              mappedField = 'careerpageurl';
            } else if (normalized === 'companywebsite' || normalized === 'websiteurl') {
              mappedField = 'website';
            }
          }
          
          if (mappedField) {
            mappedRow[mappedField] = value;
          } else {
            // Keep original column name
            mappedRow[csvCol] = value;
          }
        }
        return mappedRow;
      });
      console.log('Mapped rows sample:', rows.slice(0, 2));
    }

    // Validate rows using normalized field names
    const validators = [
      { field: 'companyname', required: true, maxLength: 200 },
      { field: 'country', required: true, maxLength: 100 },
      { field: 'website', required: false, custom: (value: string) => 
        !isValidUrl(value) ? 'Invalid website URL' : null 
      },
      { field: 'careerpageurl', required: false, custom: (value: string) => 
        !isValidUrl(value) ? 'Invalid career page URL' : null 
      },
      { field: 'tags', required: false, maxLength: 500 },
      { field: 'notes', required: false, maxLength: 2000 },
    ];

    const allErrors: CsvError[] = [];
    const validRows: BulkCompanyRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as BulkCompanyRow;
      const rowNumber = i + 2;

      const rowErrors = validateRow(row, validators as any, rowNumber);
      
      if (rowErrors.length > 0) {
        allErrors.push(...rowErrors);
      } else {
        validRows.push(row);
      }
    }

    console.log('Validation results:', { validRows: validRows.length, errors: allErrors.length });

    if (allErrors.length > 0 && validRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'All rows have validation errors',
        errors: allErrors,
      }, { status: 400 });
    }

    // Import valid rows
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const importErrors: CsvError[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const originalRowIndex = rows.indexOf(row) + 2;
      
      try {
        // Check for duplicate (same name + country)
        const existing = await OutreachCompany.findOne({
          nameLower: row.companyname!.toLowerCase().trim(),
          countryLower: row.country!.toLowerCase().trim(),
        }).lean() as any;

        const tags = row.tags
          ? row.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [];

        if (existing) {
          // Update: merge missing fields
          const updateData: Record<string, any> = {};
          
          if ((!existing.website || !existing.website.trim()) && row.website) {
            updateData.website = row.website.trim();
          }
          if ((!existing.careerPageUrl || !existing.careerPageUrl.trim()) && row.careerpageurl) {
            updateData.careerPageUrl = row.careerpageurl.trim();
          }
          if ((!existing.tags || existing.tags.length === 0) && tags.length > 0) {
            updateData.tags = tags;
          }
          if ((!existing.notes || !existing.notes.trim()) && row.notes) {
            updateData.notes = row.notes.trim();
          }

          if (Object.keys(updateData).length > 0) {
            await OutreachCompany.updateOne(
              { _id: existing._id },
              { $set: updateData }
            );
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new company
          await OutreachCompany.create({
            name: row.companyname!.trim(),
            country: row.country!.trim(),
            website: row.website?.trim() || undefined,
            careerPageUrl: row.careerpageurl?.trim() || undefined,
            tags,
            notes: row.notes?.trim() || undefined,
          });
          imported++;
        }
      } catch (error: any) {
        importErrors.push({
          row: originalRowIndex,
          message: error.message || 'Failed to import row',
        });
      }
    }

    console.log('Import complete:', { imported, updated, skipped, importErrors: importErrors.length });

    return NextResponse.json({
      success: true,
      data: {
        imported,
        updated,
        skipped,
        total: rows.length,
        errors: importErrors,
        validationErrors: allErrors,
      },
    });
  } catch (error) {
    console.error('Bulk company import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import companies' },
      { status: 500 }
    );
  }
}
