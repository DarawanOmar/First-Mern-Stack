/*
  Warnings:

  - Made the column `gender` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `gender` ENUM('MALE', 'FEMALE') NOT NULL;
