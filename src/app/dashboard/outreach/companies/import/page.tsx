"use client";

import BulkImportPage from "@/components/dashboard/BulkImportPage";

const requiredFields = [
  { key: "companyname", label: "CompanyName" },
  { key: "country", label: "Country" },
];

const optionalFields = [
  { key: "website", label: "Website" },
  { key: "careerpageurl", label: "CareerPageUrl" },
  { key: "tags", label: "Tags" },
  { key: "notes", label: "Notes" },
];

const exampleCsv = `CompanyName,Country,Website,CareerPageUrl,Tags,Notes
Acme Inc,United States,https://acme.com,https://acme.com/careers,"tech,startup","Fortune 500 company"
Beta Corp,UK,https://beta.co.uk,,finance,"Legacy fintech"
Gamma LLC,Canada,https://gamma.ca,https://gamma.ca/jobs,"healthcare,medical","Health tech startup"
Delta Tech,Australia,https://delta.au,,saas,"Growing startup"
Epsilon Io,Germany,https://epsilon.de,https://epsilon.de/karriere,"iot,embedded","Industrial IoT"`;

export default function ImportCompaniesPage() {
  return (
    <BulkImportPage
      title="Outreach • Import Companies"
      description="Bulk import companies from CSV file."
      apiEndpoint="/api/outreach/companies/bulk"
      requiredFields={requiredFields}
      optionalFields={optionalFields}
      exampleCsv={exampleCsv}
    />
  );
}
