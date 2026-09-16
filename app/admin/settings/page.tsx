import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cài đặt trang</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
