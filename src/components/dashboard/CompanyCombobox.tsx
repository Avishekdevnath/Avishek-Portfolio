"use client";
import GenericCombobox from '../shared/GenericCombobox';

interface CompanyComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CompanyCombobox({ value, onChange, error }: CompanyComboboxProps) {
  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      error={error}
      fetchUrl="/api/job-hunt/companies"
      mapResults={(data) => (data.data ?? []).map((c: { name: string }) => c.name)}
      createUrl="/api/job-hunt/companies"
      createPayload={(query) => ({ name: query })}
      placeholder="e.g., TechCorp Inc"
      labelAdd="Add as new company"
    />
  );
}
