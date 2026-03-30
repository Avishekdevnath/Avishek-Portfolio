'use client';

export default function JobHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <div className="max-w-6xl mx-auto py-5">
        {children}
      </div>
    </div>
  );
}
