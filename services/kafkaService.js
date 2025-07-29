const { Kafka } = require('kafkajs');

const { kafkaBroker, kafkaClientId, kafkaConsumerGroupId, kafkaConsumerTopicsToRead } = require('../config/config.js');

class KafkaService {
    constructor() {
        this.kafka = new Kafka({
            clientId: kafkaClientId,
            brokers: [kafkaBroker]
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({
            groupId: kafkaConsumerGroupId
        });
        this.isProducerConnected = false;
        this.isConsumerConnected = false;
    }

    async connectProducer() {
        if (!this.isProducerConnected) {
            await this.producer.connect();
            this.isProducerConnected = true;
        }
    }

    async connectConsumer() {
        if (!this.isConsumerConnected) {
            await this.consumer.connect();
            this.isConsumerConnected = true;
        }
    }

    async sendMessage(topic, message) {
        try {
            await this.connectProducer();

            await this.producer.send({
                topic: topic,
                messages: [
                    {
                        value: message
                    }
                ],
            });

            console.log('Message sent successfully!');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async runConsumer(topic) {
        if(kafkaConsumerTopicsToRead.includes(topic)){
            await this.connectConsumer();

            await this.consumer.subscribe({
                topic: topic,
                fromBeginning: true
            });

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const value = message.value.toString();
                    console.log("Final Message in Consumer: ", value);
                },
            });
        }
    }

    async disconnect() {
        if (this.isProducerConnected) {
            await this.producer.disconnect();
            this.isProducerConnected = false;
        }
        if (this.isConsumerConnected) {
            await this.consumer.disconnect();
            this.isConsumerConnected = false;
        }
    }
}

module.exports = new KafkaService();