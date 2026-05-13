import { requireAdminSession } from "@/lib/auth/admin";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminSession();

  return (
    <SidebarProvider>
      {/* Pass the deeply verified admin info into the sidebar so it displays their name and role. */}
      {/* Since AppSidebar is a client component, pass serializable data. */}
      <AppSidebar admin={{ name: admin.fullName, email: admin.email, role: admin.role }} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
