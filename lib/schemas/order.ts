import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ");

export const orderItemSchema = z.object({
  productId: z.string().uuid("Sản phẩm không hợp lệ"),
  quantity: z.number().int().min(1).max(50).optional(),
  // Ignored by the server (rental days are derived from rentStart/rentEnd); kept for older clients.
  rentDays: z.number().int().min(1).max(365).optional(),
});

export const createOrderSchema = z.object({
  type: z.enum(["sale", "rent"], "Loại yêu cầu không hợp lệ"),
  customerName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Số điện thoại không hợp lệ")
    .max(20)
    .regex(/^[0-9+()\-.\s]+$/, "Số điện thoại không hợp lệ"),
  customerEmail: z.string().trim().email("Email không hợp lệ").max(200).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  rentStart: isoDate.optional(),
  rentEnd: isoDate.optional(),
  items: z.array(orderItemSchema).min(1, "Giỏ hàng trống").max(20),
  // One token per submission group; a retry with the same token returns the same order.
  clientToken: z.string().uuid("Mã gửi yêu cầu không hợp lệ").optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
