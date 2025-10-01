import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1759334974240 implements MigrationInterface {
    name = 'InitialMigration1759334974240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Token" ALTER COLUMN "created_at" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Token" ALTER COLUMN "created_at" DROP DEFAULT`);
    }

}
