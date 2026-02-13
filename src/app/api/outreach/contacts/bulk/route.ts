import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import OutreachCompany from '@/models/OutreachCompany';
import { ensureDashboardAuth } from '../../_auth';
import {
  parseCsv,
  validateRow,
  isValidEmail,
  isValidUrl,
  CsvRow,
  CsvError,
} from '@/lib/csv-parser';

interface ColumnMapping {
  [csvColumn: string]: string;
}

interface BulkContactRow extends CsvRow {
  companyname?: string;
  name?: string;
  email?: string;
  roletitle?: string;
  linkedinurl?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { csvData, columnMapping } = body;

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { success: false, error: 'CSV data is required' },
        { status: 400 }
      );
    }

    // Parse CSV
    const parseResult = parseCsv(csvData);
    
    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse CSV',
        details: parseResult.errors,
      }, { status: 400 });
    }

    // Apply column mapping if provided
    let rows = parseResult.rows;
    if (columnMapping && typeof columnMapping === 'object') {
      rows = rows.map((row) => {
        const mappedRow: CsvRow = {};
        for (const [csvCol, value] of Object.entries(row)) {
          const mappedField = columnMapping[csvCol];
          if (mappedField) {
            mappedRow[mappedField] = value;
          } else {
            mappedRow[csvCol] = value;
          }
        }
        return mappedRow;
      });
    }

    // Validate rows
    const validators = [
      { field: 'companyname', required: true, maxLength: 200 },
      { field: 'name', required: true, maxLength: 100 },
      { field: 'email', required: true, maxLength: 200, custom: (value: string) => 
        !isValidEmail(value) ? 'Invalid email format' : null 
      },
      { field: 'roletitle', required: false, maxLength: 100 },
      { field: 'linkedinurl', required: false, custom: (value: string) => 
        !isValidUrl(value) ? 'Invalid LinkedIn URL' : null 
      },
      { field: 'notes', required: false, maxLength: 2000 },
    ];

    const allErrors: CsvError[] = [];
    const validRows: BulkContactRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as BulkContactRow;
      const rowNumber = i + 2;

      const rowErrors = validateRow(row, validators as any, rowNumber);
      
      if (rowErrors.length > 0) {
        allErrors.push(...rowErrors);
      } else {
        validRows.push(row);
      }
    }

    if (allErrors.length > 0 && validRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'All rows have validation errors',
        errors: allErrors,
      }, { status: 400 });
    }

    // Build company name to ID map
    const companies = await OutreachCompany.find({}, { name: 1, nameLower: 1 }).lean();
    const companyMap: Record<string, string> = {};
    for (const company of companies) {
      const c = company as any;
      companyMap[c.nameLower] = c._id.toString();
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
        // Find company by name (case-insensitive)
        const companyNameLower = row.companyname!.toLowerCase().trim();
        const companyId = companyMap[companyNameLower];

        if (!companyId) {
          skipped++;
          importErrors.push({
            row: originalRowIndex,
            field: 'companyname',
            message: `Company '${row.companyname}' not found`,
          });
          continue;
        }

        // Check for duplicate email (globally unique across all contacts)
        const existing = await OutreachContact.findOne({
          emailLower: row.email!.toLowerCase().trim(),
        }).lean() as any;

        if (existing) {
          // Update: merge missing fields
          const updateData: Record<string, any> = {};
          
          if ((!existing.name || !existing.name.trim()) && row.name) {
            updateData.name = row.name.trim();
          }
          if ((!existing.roleTitle || !existing.roleTitle.trim()) && row.roletitle) {
            updateData.roleTitle = row.roletitle.trim();
          }
          if ((!existing.linkedinUrl || !existing.linkedinUrl.trim()) && row.linkedinurl) {
            updateData.linkedinUrl = row.linkedinurl?.trim() || '';
          }
          if ((!existing.notes || !existing.notes.trim()) && row.notes) {
            updateData.notes = row.notes.trim();
          }

          if (Object.keys(updateData).length > 0) {
            await OutreachContact.updateOne(
              { _id: existing._id },
              { $set: updateData }
            );
            updated++;
          } else {
            skipped++;
          }
        } else {
          await OutreachContact.create({
            companyId,
            name: row.name!.trim(),
            email: row.email!.trim(),
            roleTitle: row.roletitle?.trim() || undefined,
            linkedinUrl: row.linkedinurl?.trim() || undefined,
            notes: row.notes?.trim() || undefined,
            status: 'new',
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
    console.error('Bulk contact import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
