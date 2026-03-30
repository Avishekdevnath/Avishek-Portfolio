"use client";

import { useState, useEffect, useRef } from "react";

interface GenericComboboxProps<T> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  fetchUrl: string;
  mapResults: (data: any) => T[];
  createUrl?: string;
  createPayload?: (query: string) => any;
  placeholder?: string;
  labelAdd?: string;
  getOptionLabel?: (item: T) => string;
  getOptionValue?: (item: T) => string;
}

export default function GenericCombobox<T>({
  value,
  onChange,
  error,
  fetchUrl,
  mapResults,
  createUrl,
  createPayload,
  placeholder = "Type to search...",
  labelAdd = "Add",
  getOptionLabel,
}: GenericComboboxProps<T>) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = query.trim() ? `${fetchUrl}?search=${encodeURIComponent(query)}&limit=8` : `${fetchUrl}?limit=8`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(mapResults(data));
      } catch {
        setResults([]);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchUrl, mapResults]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectItem = (item: T) => {
    const label = getOptionLabel ? getOptionLabel(item) : (item as any).name ?? String(item);
    setQuery(label);
    onChange(label);
    setOpen(false);
  };

  const createItem = async () => {
    if (!query.trim() || !createUrl || !createPayload) return;
    setCreating(true);
    try {
      const res = await fetch(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload(query.trim())),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to create item`);
      const name = data.data?.name || data.company?.name || data.platform?.name || query.trim();
      selectItem(name);
    } catch (err) {
      // Optionally handle error
    } finally {
      setCreating(false);
      setOpen(false);
    }
  };

  const hasExactMatch = results.some((r) => {
    const label = getOptionLabel ? getOptionLabel(r) : (r as any).name ?? String(r);
    return label.toLowerCase() === query.toLowerCase().trim();
  });
  const showAddOption = query.trim().length > 0 && !hasExactMatch && createUrl && createPayload;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          if (e.target.value.trim()) setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0 || query.trim()) setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {open && (results.length > 0 || showAddOption) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
          {results.map((item) => {
            const label = getOptionLabel ? getOptionLabel(item) : (item as any).name ?? String(item);
            const key = (item as any)._id || label;
            return (
              <li
                key={key}
                onMouseDown={() => selectItem(item)}
                className="px-3 py-2 text-sm text-gray-800 hover:bg-orange-50 cursor-pointer capitalize"
              >
                {label}
              </li>
            );
          })}
          {showAddOption && (
            <li
              onMouseDown={createItem}
              className="px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 cursor-pointer border-t border-gray-100 flex items-center gap-2"
            >
              {creating ? (
                <span className="text-gray-400">Adding...</span>
              ) : (
                <>
                  <span className="font-medium">+</span>
                  {labelAdd} &ldquo;<span className="font-medium">{query.trim()}</span>&rdquo;
                </>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
