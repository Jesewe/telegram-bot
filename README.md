<div align="center">
   <img src="src/img/icon.png" alt="Telegram Bot" width="200" height="200"> 
   <h1>Telegram Bot</h1> 
   <p>A simple Telegram bot that provides helpful commands.</p> 
   <a href="#features"><strong>Features</strong></a> •
   <a href="#installation"><strong>Installation</strong></a> •
   <a href="#dependencies"><strong>Dependencies</strong></a> •
   <a href="#logging"><strong>Logging</strong></a>
</div>

---

# Overview

**Telegram Bot** is a basic, informative Telegram bot that interacts with users via simple commands. It's built using the [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) library.

## Features

- **`/start`** - Sends a welcome message with an inline keyboard for quick access to help and bot info.
- **`/help`** - Lists all available commands for the user.
- **`/info`** - Provides detailed information about the bot.
- **`/joke`** - Fetches a random joke from an external joke API and sends it to the user.
- **`/weather <city>`** - Retrieves current weather information for the specified city.
- **`/cat`** - Sends a random cute cat image.
- **`/dog`** - Sends a random cute dog image.
- **`/time`** - Shows the current server time.
- **Echo** - Any non-command text is echoed back to the user.

## Installation

1. **Clone this repository:**

   ```bash
   git clone https://github.com/Jesewe/telegram-bot.git
   cd telegram-bot
   ```

2. **Install the required dependencies:**

   ```bash
   npm install
   ```

3. **Create a `config.json` file in the root directory with the following structure:**

   ```json
   {
     "token": "YOUR_REAL_BOT_TOKEN_HERE",
     "botName": "Telegram Bot"
   }
   ```

4. **Run the bot:**

   ```bash
   node bot.js
   ```

## Dependencies

- **[node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)**: Telegram Bot API wrapper for Node.js.
- **[axios](https://axios-http.com/)**: HTTP client for making requests to external APIs (joke, weather, cat, and dog image APIs).

## Logging

When the bot starts, it logs the following to the console:

```bash
Telegram Bot is running...
```

Any polling errors or issues (e.g., while fetching a joke or weather data) are logged in the console with error details. For example:

```bash
Error fetching joke: Error message here
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.