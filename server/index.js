'use strict';

const Alexa = require("alexa-sdk");
const unirest = require('unirest');

const PHRASES = require("./phrases");
const WEBHOOK = "https://i-webhooktodbpsql-proj350166.6a63.fuse-ignite.openshiftapps.com/webhook/iasaqOSXL9Q0YNZm6eJqO8L2Tx2ucsTlm4HKJ7DGsRkqLB2cip";
const id = "123";

const handlers = {
    "LaunchRequest": function () {
        this.attributes.speechOutput = PHRASES.WELCOME;
        this.attributes.repromptSpeech = `${PHRASES.REPROMPT} ${PHRASES.HELP}`;
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    "Unhandled": function () {
        this.attributes.speechOutput = PHRASES.HELP;
        this.attributes.repromptSpeech = PHRASES.REPROMPT;
        this.emit(":ask", this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    "SessionEndedRequest": function () {
        this.emit(":tell", PHRASES.GOODBYE);
    },
    "AMAZON.HelpIntent": function () {
        this.attributes.speechOutput = PHRASES.HELP;
        this.attributes.repromptSpeech = PHRASES.REPROMPT;
        this.emit(":ask", this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    "AMAZON.RepeatIntent": function() {
        this.emit(":ask", this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    "AMAZON.StopIntent": function () {
        this.emit("SessionEndedRequest");
    },
    "AMAZON.CancelIntent": function () {
        this.emit("SessionEndedRequest");
    },
    "planify": function() {
        console.log(JSON.stringify(this.event.request.intent));

        const taskSlot = this.event.request.intent.slots.task;

        if (taskSlot && taskSlot.value) {
            let task = taskSlot.value.toLowerCase();

            unirest
                .post(WEBHOOK)
                .send({ id, task})
                .headers({"Content-Type": "application/json"})
                .end( response => {
                    console.log(JSON.stringify(response));
                    this.emit(":tell", PHRASES.ON_SUCCESS);
                });

        } else {
            this.attributes.speechOutput = "I'm sorry, i currently do not know";
            this.attributes.repromptSpeech = "Can you repeat your question in other words ?";

            this.emit(":ask", this.attributes.speechOutput, this.attributes.repromptSpeech);
        }

    }
};

exports.handlers = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
