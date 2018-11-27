'use strict';

const Alexa = require("alexa-sdk");
const unirest = require('unirest');

const PHRASES = require("./phrases");

const DEFAULT_WEBHOOK = "https://i-webhooktodbpsql-proj350166.6a63.fuse-ignite.openshiftapps.com/webhook/iasaqOSXL9Q0YNZm6eJqO8L2Tx2ucsTlm4HKJ7DGsRkqLB2cip";
const WEBHOOK = process.env.WEBHOOK || DEFAULT_WEBHOOK;

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
    "addTransaction": function() {
        console.log(JSON.stringify(`intent= ${JSON.stringify(this.event.request)}`));
        console.log(JSON.stringify(`dialogState= ${this.event.request.dialogState}`));

        if (this.event.request.dialogState === 'STARTED'){
            console.log(JSON.stringify(` STARTED dialogState`));
            let updatedIntent = this.event.request.intent;
            this.emit(':delegate', updatedIntent);
        } else if (this.event.request.dialogState != 'COMPLETED'){
            console.log(JSON.stringify(` != COMPLETED dialogState`));
            this.emit(':delegate');
        } else {
            let intent = this.event.request.intent;
            const transactionSlot = intent.slots.transaction;

            console.log(JSON.stringify(` COMPLETE dialogState ${intent.confirmationStatus}`));

            if (intent.confirmationStatus === 'DENIED') {
                this.emit(":tell", PHRASES.CONFIRMATION_DENIED);
            } else {

                let task = transactionSlot.value.toLowerCase();

                let body = {task};

                unirest
                    .post(WEBHOOK)
                    .type('json')
                    .send(body)
                    .end( response => {
                        console.log(`response=${JSON.stringify(response)}`);
                        this.emit(":ask", response.statusCode != 200 ? PHRASES.ON_SUCCESS : PHRASES.TECHNICAL_ERROR);
                    });

            }
        }
    }
};

exports.handlers = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
