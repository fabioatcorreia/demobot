const restify = require('restify');
const builder = require('botbuilder');

const menu = require('./menu');

String.prototype.format = String.prototype.format || function () {
    a = this;
    for (let k in arguments) {
        a = a.replace("{" + k + "}", arguments[k]);
    }
    return a;
}

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || 8080, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// TODO: Remover chaves

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId || "00f6afa1-848b-45fe-b394-7c401fa8be59",
    appPassword: process.env.MicrosoftAppPassword || "xkQDVVZ05$@|dqquxMV391}"
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
    } else if (session.message.text.toLowerCase().includes('menu')) {
        menu.getTodayMenu().then(ementa => session.send(ementa));
    } else {
        session.send(`Sorry I didn't understand you...
        Try help for all the available options`);
    }
});

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        // Say hello when joining conversation
        if (message.membersAdded.find(member => member.id === message.address.bot.id)) {
            // const isGroup

            const reply = new builder.Message()
                .address(message.address)
                .text('Hello');
            bot.send(reply);
        }
    } else if (message.membersRemoved) {
        // See if bot was removed
        var botId = message.address.bot.id;
        for (var i = 0; i < message.membersRemoved.length; i++) {
            if (message.membersRemoved[i].id === botId) {
                // Say goodbye
                var reply = new builder.Message()
                    .address(message.address)
                    .text("Goodbye");
                bot.send(reply);
                break;
            }
        }
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
    help: Currently available options  
    menu: Current day menu`);
    // menu    : Show today menu
    // weekMenu: Show current week menu
}

function getSender(message) {
    const name = message.user ? message.user.name : null;
    return name || 'there';
}