"use client";
import GenericCombobox from '../shared/GenericCombobox';

interface PlatformComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function PlatformCombobox({ value, onChange, error }: PlatformComboboxProps) {
  return (
    <GenericCombobox
      value={value}
      onChange={onChange}
      error={error}
      fetchUrl="/api/job-hunt/platforms"
      mapResults={(data) => (data.data ?? []).map((p: { _id: string, name: string }) => ({ _id: p._id, name: p.name }))}
      createUrl="/api/job-hunt/platforms"
      createPayload={(query) => ({ name: query })}
      placeholder="e.g., LinkedIn"
      labelAdd="Add as new platform"
      getOptionLabel={(item) => item.name}
      getOptionValue={(item) => item.name}
    />
  );
}
