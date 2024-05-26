import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { execSync } from 'node:child_process';

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    });

    it('should be able to create a new transaction', async () => {
        const transaction = await request(app.server)
            .post('/transactions')
            .send({ title: 'New transaction', amount: 5000, type: 'credit' });

        expect(transaction.statusCode).toEqual(201);
    });

    it('should be able to list all transactions', async () => {
        const createdTransaction = await request(app.server)
            .post('/transactions')
            .send({ title: 'New transaction', amount: 5000, type: 'credit' });

        const cookies = createdTransaction.get('Set-Cookie') ?? [];

        const listTransactions = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);

        expect(listTransactions.body.transactions).toEqual([
            expect.objectContaining({ title: 'New transaction', amount: 5000 }),
        ]);
    });
});
