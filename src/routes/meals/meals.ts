import { FastifyInstance } from 'fastify';
import { date, z } from 'zod';
import { knex } from '../../database';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../../middlewares/check-session-id-exists';

export async function mealsRoutes(app: FastifyInstance) {
    app.get(
        '/',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const { sessionId } = request.cookies;

            const meals = await knex('meals')
                .where('session_id', sessionId)
                .select();

            return { meals };
        }
    );

    app.get(
        '/metrics',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const { sessionId } = request.cookies;

            const [{ mealsTotal }] = await knex('meals')
                .where('session_id', sessionId)
                .count('*', { as: 'mealsTotal' });

            const [{ mealsInDiet }] = await knex('meals')
                .where({ diet: 'yes', session_id: sessionId })
                .count('*', { as: 'mealsInDiet' });

            const [{ mealsOutDiet }] = await knex('meals')
                .where({ diet: 'no', session_id: sessionId })
                .count('*', { as: 'mealsOutDiet' });

            const meals = await knex('meals')
                .where('session_id', sessionId)
                .orderBy('created_at', 'asc');

            let maxStreak = 0;
            let currentStreak = 0;

            meals.forEach((meal) => {
                if (meal.diet === 'yes') {
                    currentStreak += 1;
                    if (currentStreak > maxStreak) {
                        maxStreak = currentStreak;
                    }
                } else {
                    currentStreak = 0;
                }
            });

            return { mealsTotal, mealsInDiet, mealsOutDiet, streak: maxStreak };
        }
    );

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);

        const { sessionId } = request.cookies;

        const meal = await knex('meals')
            .where({ id, session_id: sessionId })
            .first();

        return { meal };
    });

    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string().date(),
            hour: z.string().time(),
            diet: z.enum(['yes', 'no']),
        });

        const { name, description, date, hour, diet } =
            createMealBodySchema.parse(request.body);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        }

        const mealId = randomUUID();

        await knex('meals').insert({
            id: mealId,
            name,
            description,
            date,
            hour,
            diet,
            session_id: sessionId,
        });

        const meal = await knex('meals')
            .where({ id: mealId, session_id: sessionId })
            .first();

        return reply.status(201).send({ meal });
    });

    app.put('/:id', async (request, reply) => {
        const updateMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string().date(),
            hour: z.string().time(),
            diet: z.enum(['yes', 'no']),
        });

        const { name, description, date, hour, diet } =
            updateMealBodySchema.parse(request.body);

        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMealParamsSchema.parse(request.params);
        const { sessionId } = request.cookies;

        await knex('meals')
            .update({
                name,
                description,
                date,
                hour,
                diet,
            })
            .where({ id, session_id: sessionId });

        const meal = await knex('meals')
            .where({ id, session_id: sessionId })
            .first();

        return reply.status(201).send({ meal });
    });

    app.delete(
        '/:id',
        { preHandler: [checkSessionIdExists] },
        async (request, reply) => {
            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            });

            const { id } = getMealParamsSchema.parse(request.params);

            const { sessionId } = request.cookies;

            const meal = await knex('meals')
                .delete()
                .where({ id, session_id: sessionId });

            return reply.status(204).send();
        }
    );
}
