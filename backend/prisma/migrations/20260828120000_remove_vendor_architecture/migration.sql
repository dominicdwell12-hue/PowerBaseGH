-- Arcvan Ghana Limited is a single-store platform. This migration removes
-- the unused multi-vendor architecture (Vendor model + vendor_id FKs).
--
-- Order matters: FK columns referencing `vendors` must be dropped before
-- the `vendors` table itself, since both FKs are ON DELETE RESTRICT.

-- 1. Drop FK constraint + index + column on `order_items`
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_vendor_id_fkey`;
ALTER TABLE `order_items` DROP COLUMN `vendor_id`;

-- 2. Drop FK constraint + index + column on `products`
ALTER TABLE `products` DROP FOREIGN KEY `products_vendor_id_fkey`;
ALTER TABLE `products` DROP INDEX `products_vendor_id_idx`;
ALTER TABLE `products` DROP COLUMN `vendor_id`;

-- 3. Drop the `vendors` table itself (now unreferenced)
DROP TABLE `vendors`;
