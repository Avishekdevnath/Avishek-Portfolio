"use client";

import BulkImportPage from "@/components/dashboard/BulkImportPage";

const requiredFields = [
  { key: "companyname", label: "Company Name" },
  { key: "name", label: "Contact Name" },
  { key: "email", label: "Email" },
];

const optionalFields = [
  { key: "roletitle", label: "Role Title" },
  { key: "linkedinurl", label: "LinkedIn URL" },
  { key: "notes", label: "Notes" },
];

const exampleCsv = `Company Name,Contact Name,Email,Role Title,LinkedIn URL,Notes
Acme Inc,John Smith,john@acme.com,CTO,https://linkedin.com/in/johnsmith,"Referred by Jane"
Beta Corp,Sarah Jones,sarah@beta.co.uk,HR Manager,,,"Hiring for dev roles"
Gamma LLC,Mike Brown,mike@gammamed.com,CEO,,,"Cold outreach target"
Delta Tech,Lisa Chen,lisa@delta.au,Engineering Manager,https://linkedin.com/in/lisachen,Met at conference
Epsilon Io,Hans Mueller,hans.mueller@epsilon.de,CTO,,,"Interested in collaboration"`;

export default function ImportContactsPage() {
  return (
    <BulkImportPage
      title="Outreach • Import Contacts"
      description="Bulk import contacts from CSV file. Companies must exist before importing contacts."
      apiEndpoint="/api/outreach/contacts/bulk"
      requiredFields={requiredFields}
      optionalFields={optionalFields}
      exampleCsv={exampleCsv}
    />
  );
}
