const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');

// Load the configuration file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create the bot with the token from the config file
const bot = new TelegramBot(config.token, { polling: true });

// Log when the bot is running
console.log(`${config.botName} is running...`);

// /start command with inline keyboard for quick actions
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `Hello, ${msg.from.first_name}! Welcome to ${config.botName}. I can assist you with various tasks. Type /help to see what I can do.`;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Help', callback_data: 'help' }],
                [{ text: 'Info', callback_data: 'info' }]
            ]
        }
    };
    bot.sendMessage(chatId, welcomeMessage, options);
});

// /help command: List available commands
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `Available commands:
    
/start - Start interacting with the bot
/help - Show this help message
/info - Bot information
/joke - Get a random joke
/weather <city> - Get current weather for a city
/cat - Get a random cat picture
/dog - Get a random dog picture
/time - Get the current server time`;
    bot.sendMessage(chatId, helpMessage);
});

// /info command: Provide bot details
bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    const infoMessage = `Bot Name: ${config.botName}
Version: 1.0
I was created to help and entertain you with useful information and fun surprises!`;
    bot.sendMessage(chatId, infoMessage);
});

// /joke command: Fetch a random joke
bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = response.data;
        const jokeMessage = `${joke.setup}\n\n${joke.punchline}`;
        bot.sendMessage(chatId, jokeMessage);
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a joke right now. Please try again later.");
        console.error('Error fetching joke:', error);
    }
});

// /weather command: Get weather info for a given city using wttr.in
bot.onText(/\/weather(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1] ? match[1].trim() : null;
    if (!city) {
        bot.sendMessage(chatId, "Please provide a city name. Usage: /weather <city>");
        return;
    }
    try {
        // wttr.in provides a JSON weather report
        const url = `http://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const response = await axios.get(url);
        const weatherData = response.data;
        const current = weatherData.current_condition[0];
        const weatherMessage = `Weather in ${city}:
Temperature: ${current.temp_C}°C
Condition: ${current.weatherDesc[0].value}
Humidity: ${current.humidity}%
Wind Speed: ${current.windspeedKmph} km/h`;
        bot.sendMessage(chatId, weatherMessage);
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the weather data at the moment.");
        console.error('Error fetching weather:', error);
    }
});

// /cat command: Send a random cat image
bot.onText(/\/cat/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search');
        const catData = response.data[0];
        if (catData && catData.url) {
            bot.sendPhoto(chatId, catData.url, { caption: "Here's a cute cat for you!" });
        } else {
            bot.sendMessage(chatId, "Sorry, I couldn't fetch a cat image right now.");
        }
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a cat image at the moment.");
        console.error('Error fetching cat image:', error);
    }
});

// /dog command: Send a random dog image
bot.onText(/\/dog/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.thedogapi.com/v1/images/search');
        const dogData = response.data[0];
        if (dogData && dogData.url) {
            bot.sendPhoto(chatId, dogData.url, { caption: "Here's a cute dog for you!" });
        } else {
            bot.sendMessage(chatId, "Sorry, I couldn't fetch a dog image right now.");
        }
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a dog image at the moment.");
        console.error('Error fetching dog image:', error);
    }
});

// /time command: Return the current server time
bot.onText(/\/time/, (msg) => {
    const chatId = msg.chat.id;
    const now = new Date();
    const timeString = now.toLocaleString();
    bot.sendMessage(chatId, `Current server time is: ${timeString}`);
});

// Handle callback queries from inline keyboards
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    switch (data) {
        case 'help':
            bot.sendMessage(message.chat.id, "Type /help to see all available commands.");
            break;
        case 'info':
            bot.sendMessage(message.chat.id, `This bot is called ${config.botName} and is here to help and entertain you!`);
            break;
        default:
            bot.sendMessage(message.chat.id, "Unknown action.");
    }
    // Acknowledge the callback query to remove the loading state on the client
    bot.answerCallbackQuery(callbackQuery.id);
});

// Echo any non-command text message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text && !msg.text.startsWith('/')) {
        bot.sendMessage(chatId, `You said: ${msg.text}`);
    }
});

// Gracefully handle polling errors
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code, error.message);
});