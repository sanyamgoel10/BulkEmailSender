const config = require('./config/config.js');

const express = require('express');
const app = express();

const emailRoutes = require('./routes/emailRoutes.js');

app.use(express.json());

app.use('/api', emailRoutes);

app.use((req, res) => {
    return res.status(404).json({
        status: 0,
        msg: 'Invalid Endpoint'
    });
});

app.listen(config.port, () => {
    console.log('Server is running on port: ', config.port);
});