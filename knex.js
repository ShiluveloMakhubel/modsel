module.exports = {
    production: {
        client: 'postgresql',
        connection: process.env.HEROKU_POSTGRESQL_BLUE_URL,
        migrations: {
          directory: './database/migrations',
        },
        seeds: {
          directory: './database/seeds',
        },
      },
};
  