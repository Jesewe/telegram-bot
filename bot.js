const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const axios = require('axios');

// Load the configuration file
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create the bot with the token from the config file
const bot = new TelegramBot(config.token, { polling: true });

// Store user data (in production, use a proper database)
const userData = {};

// Store temporary data for quizzes and polls
const activeQuizzes = {};

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
                [{ text: 'Info', callback_data: 'info' }],
                [{ text: 'Features', callback_data: 'features' }]
            ]
        }
    };
    bot.sendMessage(chatId, welcomeMessage, options);
});

// /help command: List available commands
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `Available commands:
    
📋 Basic Commands:
/start - Start interacting with the bot
/help - Show this help message
/info - Bot information

🎯 Fun & Entertainment:
/joke - Get a random joke
/cat - Get a random cat picture
/dog - Get a random dog picture
/quote - Get an inspirational quote
/quiz - Start a random trivia quiz
/roll [sides] - Roll a dice (default 6 sides)
/flip - Flip a coin
/8ball <question> - Ask the magic 8-ball

📊 Utilities:
/weather <city> - Get current weather for a city
/time - Get the current server time
/timezone <city> - Get time in specific timezone
/calc <expression> - Calculate math expressions
/qr <text> - Generate QR code for text
/shorten <url> - Shorten a URL
/remind <minutes> <message> - Set a reminder

👤 Personal:
/profile - View your profile
/stats - View your usage statistics
/note <text> - Save a personal note
/notes - View your saved notes`;
    bot.sendMessage(chatId, helpMessage);
});

// /info command: Provide bot details
bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    const infoMessage = `Bot Name: ${config.botName}
Version: 2.0
I was created to help and entertain you with useful information and fun surprises!

New features include:
✨ Trivia quizzes
🎲 Games (dice, coin flip, 8-ball)
📝 Personal notes
⏰ Reminders
🧮 Calculator
📊 QR code generator
🔗 URL shortener
🌍 Timezone support`;
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
        
        // Update user stats
        updateUserStats(msg.from.id, 'jokes');
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
        
        // Update user stats
        updateUserStats(msg.from.id, 'weather');
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
        
        // Update user stats
        updateUserStats(msg.from.id, 'cats');
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
        
        // Update user stats
        updateUserStats(msg.from.id, 'dogs');
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

// NEW FEATURE: /quote command: Get inspirational quote
bot.onText(/\/quote/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.quotable.io/random');
        const quote = response.data;
        const quoteMessage = `"${quote.content}"\n\n— ${quote.author}`;
        bot.sendMessage(chatId, quoteMessage);
        
        // Update user stats
        updateUserStats(msg.from.id, 'quotes');
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a quote right now. Please try again later.");
        console.error('Error fetching quote:', error);
    }
});

// NEW FEATURE: /roll command: Roll dice
bot.onText(/\/roll(?:\s+(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const sides = match[1] ? parseInt(match[1]) : 6;
    
    if (sides < 2 || sides > 100) {
        bot.sendMessage(chatId, "Please specify between 2 and 100 sides for the dice.");
        return;
    }
    
    const result = Math.floor(Math.random() * sides) + 1;
    bot.sendMessage(chatId, `🎲 You rolled a ${result} on a ${sides}-sided die!`);
    
    // Update user stats
    updateUserStats(msg.from.id, 'dice_rolls');
});

// NEW FEATURE: /flip command: Flip coin
bot.onText(/\/flip/, (msg) => {
    const chatId = msg.chat.id;
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    bot.sendMessage(chatId, `🪙 The coin landed on: **${result}**`);
    
    // Update user stats
    updateUserStats(msg.from.id, 'coin_flips');
});

// NEW FEATURE: /8ball command: Magic 8-ball
bot.onText(/\/8ball(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const question = match[1];
    
    if (!question) {
        bot.sendMessage(chatId, "Please ask a question! Usage: /8ball <your question>");
        return;
    }
    
    const answers = [
        "It is certain", "It is decidedly so", "Without a doubt", "Yes definitely",
        "You may rely on it", "As I see it, yes", "Most likely", "Outlook good",
        "Yes", "Signs point to yes", "Reply hazy, try again", "Ask again later",
        "Better not tell you now", "Cannot predict now", "Concentrate and ask again",
        "Don't count on it", "My reply is no", "My sources say no",
        "Outlook not so good", "Very doubtful"
    ];
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    bot.sendMessage(chatId, `🎱 You asked: "${question}"\n\nThe Magic 8-Ball says: **${answer}**`);
    
    // Update user stats
    updateUserStats(msg.from.id, 'eight_ball');
});

// NEW FEATURE: /calc command: Calculator
bot.onText(/\/calc(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const expression = match[1];
    
    if (!expression) {
        bot.sendMessage(chatId, "Please provide a math expression! Usage: /calc <expression>");
        return;
    }
    
    try {
        // Simple evaluation with basic security (only allow numbers, operators, parentheses)
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        if (sanitized !== expression) {
            bot.sendMessage(chatId, "Invalid characters in expression. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.");
            return;
        }
        
        const result = Function('"use strict"; return (' + sanitized + ')')();
        bot.sendMessage(chatId, `🧮 ${expression} = **${result}**`);
        
        // Update user stats
        updateUserStats(msg.from.id, 'calculations');
    } catch (error) {
        bot.sendMessage(chatId, "Invalid math expression. Please check your input.");
    }
});

// NEW FEATURE: /qr command: Generate QR code
bot.onText(/\/qr(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    
    if (!text) {
        bot.sendMessage(chatId, "Please provide text to encode! Usage: /qr <text>");
        return;
    }
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    bot.sendPhoto(chatId, qrUrl, { caption: `QR Code for: ${text}` });
    
    // Update user stats
    updateUserStats(msg.from.id, 'qr_codes');
});

// NEW FEATURE: /remind command: Set reminder
bot.onText(/\/remind(?:\s+(\d+)\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    
    if (!match || !match[1] || !match[2]) {
        bot.sendMessage(chatId, "Usage: /remind <minutes> <message>");
        return;
    }
    
    const minutes = parseInt(match[1]);
    const message = match[2];
    
    if (minutes < 1 || minutes > 1440) {
        bot.sendMessage(chatId, "Please set a reminder between 1 and 1440 minutes (24 hours).");
        return;
    }
    
    bot.sendMessage(chatId, `⏰ Reminder set! I'll remind you in ${minutes} minute(s): "${message}"`);
    
    setTimeout(() => {
        bot.sendMessage(chatId, `🔔 Reminder: ${message}`);
    }, minutes * 60 * 1000);
    
    // Update user stats
    updateUserStats(msg.from.id, 'reminders');
});

// NEW FEATURE: /note command: Save personal note
bot.onText(/\/note(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const note = match[1];
    
    if (!note) {
        bot.sendMessage(chatId, "Please provide a note to save! Usage: /note <your note>");
        return;
    }
    
    if (!userData[userId]) {
        userData[userId] = { notes: [] };
    }
    
    if (!userData[userId].notes) {
        userData[userId].notes = [];
    }
    
    userData[userId].notes.push({
        text: note,
        date: new Date().toISOString()
    });
    
    bot.sendMessage(chatId, `📝 Note saved! You now have ${userData[userId].notes.length} note(s).`);
});

// NEW FEATURE: /notes command: View saved notes
bot.onText(/\/notes/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (!userData[userId] || !userData[userId].notes || userData[userId].notes.length === 0) {
        bot.sendMessage(chatId, "You don't have any saved notes yet. Use /note <text> to save a note!");
        return;
    }
    
    let notesMessage = "📝 Your saved notes:\n\n";
    userData[userId].notes.forEach((note, index) => {
        const date = new Date(note.date).toLocaleDateString();
        notesMessage += `${index + 1}. ${note.text}\n   (${date})\n\n`;
    });
    
    bot.sendMessage(chatId, notesMessage);
});

// NEW FEATURE: /profile command: View user profile
bot.onText(/\/profile/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const user = msg.from;
    
    let profileMessage = `👤 Profile for ${user.first_name}`;
    if (user.last_name) profileMessage += ` ${user.last_name}`;
    if (user.username) profileMessage += ` (@${user.username})`;
    
    profileMessage += `\n\nUser ID: ${userId}`;
    
    if (userData[userId] && userData[userId].notes) {
        profileMessage += `\nSaved Notes: ${userData[userId].notes.length}`;
    }
    
    bot.sendMessage(chatId, profileMessage);
});

// NEW FEATURE: /stats command: View usage statistics
bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (!userData[userId] || !userData[userId].stats) {
        bot.sendMessage(chatId, "No statistics available yet. Start using the bot to see your stats!");
        return;
    }
    
    const stats = userData[userId].stats;
    let statsMessage = "📊 Your usage statistics:\n\n";
    
    Object.entries(stats).forEach(([key, value]) => {
        const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        statsMessage += `${displayName}: ${value}\n`;
    });
    
    bot.sendMessage(chatId, statsMessage);
});

// NEW FEATURE: /quiz command: Start trivia quiz
bot.onText(/\/quiz/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const questionData = response.data.results[0];
        
        if (!questionData) {
            bot.sendMessage(chatId, "Sorry, couldn't fetch a quiz question right now.");
            return;
        }
        
        const question = decodeHtmlEntities(questionData.question);
        const correctAnswer = decodeHtmlEntities(questionData.correct_answer);
        const incorrectAnswers = questionData.incorrect_answers.map(decodeHtmlEntities);
        
        // Shuffle answers
        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        const correctIndex = allAnswers.indexOf(correctAnswer);
        
        const keyboard = allAnswers.map((answer, index) => [{
            text: answer,
            callback_data: `quiz_${chatId}_${index === correctIndex ? 'correct' : 'wrong'}`
        }]);
        
        const options = {
            reply_markup: {
                inline_keyboard: keyboard
            }
        };
        
        activeQuizzes[chatId] = {
            correct: correctAnswer,
            question: question
        };
        
        bot.sendMessage(chatId, `🧠 **Trivia Quiz**\nCategory: ${questionData.category}\nDifficulty: ${questionData.difficulty}\n\n${question}`, options);
        
        // Update user stats
        updateUserStats(msg.from.id, 'quizzes');
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch a quiz question right now.");
        console.error('Error fetching quiz:', error);
    }
});

// NEW FEATURE: /timezone command: Get time in specific timezone
bot.onText(/\/timezone(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1] ? match[1].trim() : null;
    
    if (!city) {
        bot.sendMessage(chatId, "Please provide a city name. Usage: /timezone <city>");
        return;
    }
    
    try {
        // Using worldtimeapi.org for timezone data
        const response = await axios.get(`http://worldtimeapi.org/api/timezone`);
        const timezones = response.data;
        
        // Find matching timezone
        const matchingTimezone = timezones.find(tz => 
            tz.toLowerCase().includes(city.toLowerCase())
        );
        
        if (!matchingTimezone) {
            bot.sendMessage(chatId, `Couldn't find timezone for "${city}". Try a major city name.`);
            return;
        }
        
        const timeResponse = await axios.get(`http://worldtimeapi.org/api/timezone/${matchingTimezone}`);
        const timeData = timeResponse.data;
        
        const localTime = new Date(timeData.datetime).toLocaleString();
        bot.sendMessage(chatId, `🌍 Time in ${matchingTimezone}:\n${localTime}`);
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't fetch the timezone information.");
        console.error('Error fetching timezone:', error);
    }
});

// NEW FEATURE: /shorten command: URL shortener (using a simple service)
bot.onText(/\/shorten(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];
    
    if (!url) {
        bot.sendMessage(chatId, "Please provide a URL to shorten! Usage: /shorten <url>");
        return;
    }
    
    // Simple URL validation
    try {
        new URL(url);
    } catch (error) {
        bot.sendMessage(chatId, "Please provide a valid URL (including http:// or https://)");
        return;
    }
    
    try {
        // Using is.gd URL shortener service
        const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        const shortUrl = response.data;
        
        if (shortUrl.startsWith('http')) {
            bot.sendMessage(chatId, `🔗 Shortened URL:\n${shortUrl}`);
            
            // Update user stats
            updateUserStats(msg.from.id, 'url_shortens');
        } else {
            bot.sendMessage(chatId, "Sorry, couldn't shorten that URL. Please check if it's valid.");
        }
    } catch (error) {
        bot.sendMessage(chatId, "Sorry, I couldn't shorten the URL right now.");
        console.error('Error shortening URL:', error);
    }
});

// Helper function to update user statistics
function updateUserStats(userId, action) {
    if (!userData[userId]) {
        userData[userId] = { stats: {} };
    }
    if (!userData[userId].stats) {
        userData[userId].stats = {};
    }
    
    userData[userId].stats[action] = (userData[userId].stats[action] || 0) + 1;
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&rsquo;': "'",
        '&ldquo;': '"',
        '&rdquo;': '"'
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
        return entities[entity] || entity;
    });
}

// Handle callback queries from inline keyboards
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    
    if (data.startsWith('quiz_')) {
        const [, chatId, result] = data.split('_');
        const quiz = activeQuizzes[parseInt(chatId)];
        
        if (quiz) {
            if (result === 'correct') {
                bot.sendMessage(message.chat.id, `✅ Correct! The answer was: ${quiz.correct}`);
                updateUserStats(callbackQuery.from.id, 'correct_answers');
            } else {
                bot.sendMessage(message.chat.id, `❌ Wrong! The correct answer was: ${quiz.correct}`);
                updateUserStats(callbackQuery.from.id, 'wrong_answers');
            }
            delete activeQuizzes[parseInt(chatId)];
        }
    } else {
        switch (data) {
            case 'help':
                bot.sendMessage(message.chat.id, "Type /help to see all available commands.");
                break;
            case 'info':
                bot.sendMessage(message.chat.id, `This bot is called ${config.botName} and is here to help and entertain you!`);
                break;
            case 'features':
                bot.sendMessage(message.chat.id, "🎯 New features include:\n• Trivia quizzes (/quiz)\n• Games (dice, coin, 8-ball)\n• Personal notes (/note, /notes)\n• Reminders (/remind)\n• Calculator (/calc)\n• QR codes (/qr)\n• URL shortener (/shorten)\n• User statistics (/stats)");
                break;
            default:
                bot.sendMessage(message.chat.id, "Unknown action.");
        }
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