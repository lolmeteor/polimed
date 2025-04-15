import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
} 