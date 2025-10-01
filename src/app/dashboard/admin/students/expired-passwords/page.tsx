"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type ExpiredStudent = {
    id: string;
    name: string;
    email: string;
    lastPasswordUpdate: string;
    daysExpired: number;
};

export default function ExpiredPasswordsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ExpiredStudent[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                // TODO: Replace with real API when available
                // const res = await fetch("/api/admin/students/expired-passwords");
                // const data = await res.json();
                // setRows(data.items as ExpiredStudent[]);
                const mock: ExpiredStudent[] = [
                    { id: "1", name: "John Doe", email: "john@example.com", lastPasswordUpdate: "2024-05-01", daysExpired: 90 },
                    { id: "2", name: "Jane Smith", email: "jane@example.com", lastPasswordUpdate: "2024-06-12", daysExpired: 60 },
                ];
                setRows(mock);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-ui">
            <div className="container py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-h3 text-gray-900 weight-bold">Expired Passwords</h1>
                        <p className="text-body-sm text-gray-600">Students whose passwords are past the rotation policy.</p>
                    </div>
                    <Link href="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full input"
                        />
                        <button className="btn btn-primary">Export CSV</button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-gray-600">Loading...</div>
                    ) : error ? (
                        <div className="p-8 text-red-600">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="text-table-header text-gray-600">
                                        <th className="px-4 py-3 border-b">Name</th>
                                        <th className="px-4 py-3 border-b">Email</th>
                                        <th className="px-4 py-3 border-b">Last Updated</th>
                                        <th className="px-4 py-3 border-b">Days Expired</th>
                                        <th className="px-4 py-3 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((s) => (
                                        <tr key={s.id} className="text-table-cell text-gray-700">
                                            <td className="px-4 py-3 border-b">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{s.name}</span>
                                                    <span className="text-caption text-gray-500">ID: {s.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b">{s.email}</td>
                                            <td className="px-4 py-3 border-b">{s.lastPasswordUpdate}</td>
                                            <td className="px-4 py-3 border-b">
                                                <span className="chip">{s.daysExpired} days</span>
                                            </td>
                                            <td className="px-4 py-3 border-b">
                                                <div className="flex items-center gap-2">
                                                    <button className="btn-cta">Send Reset Email</button>
                                                    <button className="btn-cta">Mark Resolved</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


