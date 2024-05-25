import fastify from 'fastify';

const app = fastify();

app.get('/hello', () => {
    return 'Hello node';
});

app.listen({
    port: 3333,
}).then(() => {
    console.log(`Server running in PORT 3333`);
});
