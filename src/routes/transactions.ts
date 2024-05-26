import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';
import { title } from 'process';

export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        });

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body
        );

        await knex('transactions').insert({
            id: crypto.randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
        });

        return reply.status(201).send();
    });
}