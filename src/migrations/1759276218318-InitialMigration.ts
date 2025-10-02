import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1759276218318 implements MigrationInterface {
    name = 'InitialMigration1759276218318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Token" ("access_token" character varying NOT NULL, "expires_at" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_daca0d199fe3f4181e172aab6ed" PRIMARY KEY ("access_token"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Token"`);
    }

}
