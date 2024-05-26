import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.text('name').notNullable();
        table.text('description').notNullable();
        table.text('date').notNullable();
        table.text('hour').notNullable();
        table.enum('diet', ['yes', 'no']).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.uuid('session_id').index();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals');
}
