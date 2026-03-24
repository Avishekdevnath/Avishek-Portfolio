'use client';

export default function JobHuntLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
