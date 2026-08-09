-- AlterTable
ALTER TABLE `payments` ADD COLUMN `payment_method` VARCHAR(30) NULL, ADD COLUMN `paid_at` DATETIME(3) NULL;
