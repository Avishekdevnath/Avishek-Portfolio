# Bulk Import Feature Plan

## Overview
Add a bulk import feature for companies and contacts using CSV upload.

## Requirements

### Company Fields
| Field | Required | Notes |
|-------|----------|-------|
| name | Yes | Company name |
| country | Yes | Country (newly added) |
| website | No | URL |
| careerPageUrl | No | URL to careers page |
| tags | No | Comma-separated |
| notes | No | Text notes |

### Contact Fields
| Field | Required | Notes |
|-------|----------|-------|
| companyName | Yes | Will be linked to existing company or created |
| name | Yes | Contact name |
| email | Yes | Contact email |
| roleTitle | No | Job title |
| linkedinUrl | No | LinkedIn profile URL |
| notes | No | Text notes |

## Implementation Plan

### Step 1: Create Bulk Import API Routes
- `POST /api/outreach/companies/bulk` - Import companies from CSV
- `POST /api/outreach/contacts/bulk` - Import contacts from CSV

### Step 2: Create Bulk Import Dashboard Pages
- `/dashboard/outreach/companies/import` - CSV upload for companies
- `/dashboard/outreach/contacts/import` - CSV upload for contacts

### Step 3: Create CSV Parser Utility
- Parse CSV files with headers
- Validate required fields
- Return errors with line numbers for easy fixing

### Step 4: Create Import Preview Component
- Show preview of data to be imported
- Allow reviewing before final submission
- Show error messages for invalid rows

## API Response Format

### POST /api/outreach/companies/bulk
```json
{
  "success": true,
  "data": {
    "imported": 5,
    "skipped": 2,
    "errors": [
      { "row": 3, "error": "Company name is required" }
    ]
  }
}
```

### POST /api/outreach/contacts/bulk
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "skipped": 3,
    "errors": [
      { "row": 5, "error": "Company 'Acme Inc' not found" }
    ]
  }
}
```

## Frontend Features
1. CSV file upload with drag and drop
2. Preview table showing first 5 rows
3. Column mapping (auto-detect headers)
4. Progress indicator for large imports
5. Error summary with download option

## Sample CSV Templates

### companies.csv
```csv
name,country,website,careerPageUrl,tags,notes
Acme Inc,United States,https://acme.com,https://acme.com/careers,"tech,startup","Fortune 500 company"
Beta Corp,UK,https://beta.co.uk,,finance,"Legacy fintech"
Gamma LLC,Canada,,,"healthcare,medical","Health tech startup"
```

### contacts.csv
```csv
companyName,name,email,roleTitle,linkedinUrl,notes
Acme Inc,John Smith,john@acme.com,CTO,"https://linkedin.com/in/johnsmith","Referred by Jane"
Beta Corp,Sarah Jones,sarah@beta.co.uk,HR Manager,,,"Hiring for dev roles"
Gamma LLC,Mike Brown,mike@gammamed.com,CEO,,,"Cold outreach target"
```
