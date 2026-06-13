CREATE TABLE `PasswordResetOtp` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `otpHash` CHAR(64) NOT NULL,
  `userId` INTEGER NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `lastSentAt` DATETIME(3) NOT NULL,
  `verifiedAt` DATETIME(3) NULL,
  `consumedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `PasswordResetOtp_email_createdAt_idx`(`email`, `createdAt`),
  INDEX `PasswordResetOtp_userId_consumedAt_expiresAt_idx`
    (`userId`, `consumedAt`, `expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PasswordResetOtp`
  ADD CONSTRAINT `PasswordResetOtp_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
