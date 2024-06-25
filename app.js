const express = require('express');
const config = require('./config');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

app.use(express.json());

if ('undefined' == typeof config.port) {
    console.error("Config variables not found");
    process.exit(1);
}

app.use('/', emailRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});
