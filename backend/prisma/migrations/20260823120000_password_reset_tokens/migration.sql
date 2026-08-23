-- AlterTable
ALTER TABLE `users` ADD COLUMN `reset_password_token_hash` VARCHAR(255) NULL, ADD COLUMN `reset_password_expires_at` DATETIME(3) NULL;
