const restify = require('restify');
const builder = require('botbuilder');

const menu = require('./menu');

String.prototype.format = String.prototype.format || function () {
    a = this;
    for (k in arguments) {
        a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

menu.getTodayMenu();

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8080, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// TODO: Remover chaves

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId || "db943d81-2f39-4584-bd53-597cf8b8671a",
    appPassword: process.env.MicrosoftAppPassword || "shnshVVROD88-lcNH046^?$"
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and responds
const bot = new builder.UniversalBot(connector, function (session) {
    if (session.message.text.toLowerCase().includes('hello')) {
        const sender = getSender(session.message);
        session.send(`Hey, ${session.message.user.name}! Whenever you need I can 'help' you...`);
    } else if (session.message.text.toLowerCase().includes('help')) {
        showOptions(session);
    } else {
        session.send(`Sorry I didn't understand you...`);
    }
});

//Bot on
bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        const sender = getSender(session.message);

        var reply = new builder.Message()
            .address(message.address)
            .text(`Hello ${sender}... Thanks for adding me.`);
        bot.send(reply);
    } else {
        // delete their data
    }
});

function showOptions(session) {
    session.send(`Available options: 
        \n help: Currently available options
        `);
    // menu    : Show today menu
    // weekMenu: Show current week menu
}

function getSender(message) {
    const name = message.user ? message.user.name : null;
    return name || 'there';
}