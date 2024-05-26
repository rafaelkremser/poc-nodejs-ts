import { Knex } from 'knex';

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string;
            name: string;
            email: string;
            created_at: string;
            session_id: string;
        };
        meals: {
            id: string;
            name: string;
            description: string;
            date: string;
            hour: string;
            diet: string;
            created_at: string;
            session_id: string;
        };
    }
}
