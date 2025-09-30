import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Token" })
export class Token {
    constructor () {
        this.created_at = new Date();
    }

    @PrimaryColumn()
    access_token: string;

    @Column()
    expires_at: number;

    @Column()
    created_at: Date;
}
