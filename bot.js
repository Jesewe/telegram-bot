const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');

// Load the configuration file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create the bot with the token from the config file
const bot = new TelegramBot(config.token, { polling: true });

// Log when the bot is running
console.log(`${config.botName} is running...`);

// Welcome message when user starts the bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `Hello, ${msg.from.first_name}! Welcome to ${config.botName}. I can assist you with various tasks. Type /help to see what I can do.`;
    bot.sendMessage(chatId, welcomeMessage);
});

// Help command to list available commands
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `Here are the commands you can use:\n
    /start - Start interacting with the bot\n
    /help - List available commands\n
    /info - Get more information about the bot\n
    /joke - Get a random joke`;
    bot.sendMessage(chatId, helpMessage);
});

// Info command to provide information about the bot
bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    const infoMessage = `This bot is called ${config.botName}. It was created to demonstrate a basic Telegram bot structure.`;
    bot.sendMessage(chatId, infoMessage);
});

// Joke command
bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        // Fetch a random joke from the Official Joke API
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = response.data;

        // Send the joke to the user
        const jokeMessage = `${joke.setup}\n\n${joke.punchline}`;
        bot.sendMessage(chatId, jokeMessage);

    } catch (error) {
        // Handle any errors
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a joke at the moment. Please try again later.");
        console.error('Error fetching joke:', error);
    }
});

// Echo any non-command message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands (starting with /)
    if (!text.startsWith("/")) {
        bot.sendMessage(chatId, `You said: ${text}`);
    }
});

// Gracefully handle polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code);  // Output polling error codes
});