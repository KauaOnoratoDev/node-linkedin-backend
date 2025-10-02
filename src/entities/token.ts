import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "Token" })
export class Token {

    @PrimaryColumn()
    access_token: string;

    @Column()
    expires_at: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
}
