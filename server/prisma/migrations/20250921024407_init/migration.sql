/*
  Warnings:

  - Added the required column `funcionarioId` to the `vacinas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vacinas" ADD COLUMN     "funcionarioId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "vacinas" ADD CONSTRAINT "vacinas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
