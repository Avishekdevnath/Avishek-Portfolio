'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ApplicationDetailHeader from '@/components/dashboard/job-hunt/ApplicationDetailHeader';
import ApplicationDetailTabs from '@/components/dashboard/job-hunt/ApplicationDetailTabs';
import OverviewTab from '@/components/dashboard/job-hunt/tabs/OverviewTab';
import KeyPeopleTab from '@/components/dashboard/job-hunt/tabs/KeyPeopleTab';
import OutreachTab from '@/components/dashboard/job-hunt/tabs/OutreachTab';
import NotesTab from '@/components/dashboard/job-hunt/tabs/NotesTab';
import ApplicationAnalysisTab from '@/components/dashboard/job-hunt/tabs/ApplicationAnalysisTab';
import type { JobApplicationItem } from '@/types/job-hunt';

export default function ApplicationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const activeTab = searchParams.get('tab') || 'overview';

  const [application, setApplication] = useState<JobApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-hunt/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setApplication(data.data);
      } else {
        setError(data.error || 'Failed to load application');
      }
    } catch {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="py-16 text-center text-[#8a7a6a] text-sm">
        {error || 'Application not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <ApplicationDetailHeader
        application={application}
        onUpdate={(updated) => setApplication((prev) => prev ? { ...prev, ...updated } : prev)}
      />
      <ApplicationDetailTabs applicationId={id} />

      <div className="mt-2">
        {activeTab === 'overview' && (
          <OverviewTab application={application} onUpdate={(updated) => setApplication((prev) => prev ? { ...prev, ...updated } : prev)} />
        )}
        {activeTab === 'people' && <KeyPeopleTab sourceType="application" sourceId={id} />}
        {activeTab === 'outreach' && <OutreachTab applicationId={id} application={application} />}
        {activeTab === 'notes' && <NotesTab sourceType="application" sourceId={id} />}
        {activeTab === 'analysis' && <ApplicationAnalysisTab applicationId={id} />}
      </div>
    </div>
  );
}
