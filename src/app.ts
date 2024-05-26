import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { usersRoutes } from './routes/users/users';
import { mealsRoutes } from './routes/meals/meals';

export const app = fastify();

app.register(cookie);
app.register(usersRoutes, {
    prefix: 'users',
});
app.register(mealsRoutes, {
    prefix: 'meals',
});
