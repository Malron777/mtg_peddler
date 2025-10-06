export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--olive-50)] to-[var(--slate-50)]">
      <div className="w-full">{children}</div>
    </div>
  );
}
