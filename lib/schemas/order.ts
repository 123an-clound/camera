import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(50).optional(),
  rentDays: z.number().int().min(1).max(365).optional(),
});

export const createOrderSchema = z.object({
  type: z.enum(["sale", "rent"]),
  customerName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Số điện thoại không hợp lệ")
    .max(20)
    .regex(/^[0-9+()\-.\s]+$/, "Số điện thoại không hợp lệ"),
  customerEmail: z.string().trim().email("Email không hợp lệ").max(200).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  rentStart: z.string().optional(),
  rentEnd: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Giỏ hàng trống"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
