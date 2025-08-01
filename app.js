const config = require('./config/config.js');

const express = require('express');
const app = express();

const KafkaService = require('./services/kafkaService.js');

const emailRoutes = require('./routes/emailRoutes.js');

app.use(express.json());

app.use('/api', emailRoutes);

app.use((req, res) => {
    return res.status(404).json({
        status: 0,
        msg: 'Invalid Endpoint'
    });
});

app.listen(config.port, async () => {
    console.log('Server is running on port: ', config.port);

    // const topicName = 'send-bulk-email-topic';
    // const messageToKafka = 'Hello from Express App';
    // let i = 0;
    // setInterval(async () => {
    //     await KafkaService.sendMessage(topicName, messageToKafka + ' ' + i);
    //     i++;
    // }, 10000);

    await KafkaService.runConsumer('send-email-topic');
});