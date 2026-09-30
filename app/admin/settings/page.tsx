import { getSiteConfig } from "@/lib/site-config";
import { SettingsTabs } from "@/components/admin/config/settings-tabs";

export default async function AdminSettingsPage() {
  const { settings, ...config } = await getSiteConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt trang</h1>
        <p className="text-sm text-muted-foreground">Mọi nội dung, bố cục và giao diện trang công khai. Lưu xong trang web cập nhật ngay.</p>
      </div>
      <SettingsTabs settings={settings} config={config} />
    </div>
  );
}
