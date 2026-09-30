import type { Metadata } from "next";
import { settingText } from "@/lib/site-settings";
import { getSiteConfig } from "@/lib/site-config";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Cách cửa hàng thu thập, sử dụng và bảo vệ thông tin khi bạn gửi yêu cầu mua hoặc thuê máy ảnh.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const { settings } = await getSiteConfig();
  const store = settingText(settings, "store_name", "Camera Rent");
  const policy = settingText(settings, "privacy_policy", "");
  const phone = settingText(settings, "phone", "");
  const email = settingText(settings, "email", "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Chính sách bảo mật" }]} />
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Chính sách bảo mật</h1>
      {policy ? (
        <div className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{policy}</div>
      ) : (
        // Factual description of what this website actually processes. The shop should
        // replace it with its reviewed policy in Admin → Cài đặt → Chung.
        <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
          <p>
            Trang này mô tả thông tin mà website {store} thu thập khi bạn gửi yêu cầu mua hoặc thuê máy ảnh.
          </p>
          <h2 className="pt-2 text-xl font-semibold text-foreground">Thông tin được thu thập</h2>
          <p>
            Họ tên, số điện thoại, email (nếu bạn nhập), ghi chú, sản phẩm bạn chọn và ngày thuê. Website không có tài khoản
            khách hàng và không nhận thanh toán trực tuyến.
          </p>
          <h2 className="pt-2 text-xl font-semibold text-foreground">Mục đích sử dụng</h2>
          <p>Để cửa hàng liên hệ xác nhận yêu cầu, báo giá, tiền cọc và lịch nhận máy.</p>
          <h2 className="pt-2 text-xl font-semibold text-foreground">Lưu trữ</h2>
          <p>
            Yêu cầu được lưu trong cơ sở dữ liệu của website và chỉ tài khoản quản trị của cửa hàng xem được. Giỏ hàng được lưu
            trên trình duyệt của bạn.
          </p>
          <h2 className="pt-2 text-xl font-semibold text-foreground">Yêu cầu xem hoặc xoá thông tin</h2>
          <p>
            Liên hệ cửa hàng
            {phone && (
              <>
                {" "}
                qua số <a href={`tel:${phone}`} className="text-foreground underline">{phone}</a>
              </>
            )}
            {email && (
              <>
                {" "}
                hoặc email <a href={`mailto:${email}`} className="text-foreground underline">{email}</a>
              </>
            )}
            .
          </p>
        </div>
      )}
    </div>
  );
}
