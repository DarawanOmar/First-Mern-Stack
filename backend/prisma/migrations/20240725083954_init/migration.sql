-- AlterTable
ALTER TABLE `post` MODIFY `image` VARCHAR(191) NULL DEFAULT 'https://img.freepik.com/free-photo/3d-illustration-happy-man-with-backpack-tablet_1057-45577.jpg?ga=GA1.1.630880643.1695043245&semt=ais_user_ai_gen',
    MODIFY `published` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
