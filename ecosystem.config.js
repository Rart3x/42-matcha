// pm2 config file

module.exports = {
    apps: [
        {
            name: "matcha",
            script: "./dist/matcha/server/server.mjs",
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
