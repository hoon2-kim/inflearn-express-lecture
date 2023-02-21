// pm2 start ecosystem.config.js
// yarn add -D @babel/register
module.exports = {
    apps: [
        {
            name: "api",
            script: "./src/server-register.js",
            exec_mode: "cluster",
            watch: false,
            instances: 0,
        },
    ],
};
