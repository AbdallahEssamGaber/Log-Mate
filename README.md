# Log-Mate bot _-v3.0_

<p align="center">
<img src="https://i.imgur.com/sSqTu56.png" height="200px">
  
<h3 align="center"> A discord bot consuming Notion API to add a check-in, Tasks/Time logging and Reminders data for Notion databases. </h3>
</p>

Check-In, Logging and Reminders for workers over Discord using NodeJS Express NotionAPI and DiscordAPI

<br>
<br>
<br>
<br>
<br>
<br>

## Table of Contents

- [Requirements](#requirements)
  - [Frameworks](#frameworks)
  - [Create a Notion Database](#create-a-notion-database)
  - [Create a Discord Bot](#create-a-discord-bot)
- [Install](#install)
- [Configuration](#configuration)
- [Running the project](#running-the-project)
  <br>
  <br>
  <br>
  <br>

## Requirements

### Frameworks

For development, you will need <ins>**[Node.js](https://nodejs.org/)**</ins> and the <ins>**[npm](https://npmjs.org/)**</ins> node global package installed and ready in your environement.
<br>

### Create a Notion Database

1. Create a new [Integration](https://www.notion.so/my-integrations). To link it with your database. Don't forget to copy the integration secret to use later. _[docs if you're stuck!](https://developers.notion.com/docs/create-a-notion-integration#getting-started)_
2. Create new notion databases with the same properties ([from the code](https://github.com/AbdallahEssamGaber/daily-check-in/blob/master/src/notion.js)) and link the integration with the all databases. _[docs if you're stuck!](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions)_
   <br>

### Create a Discord Bot

Check that [simple guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to do so

<br>
<br>

## Install

    $ git clone https://github.com/AbdallahEssamGaber/Log-Mate
    $ cd Log-Mate
    $ npm install

<br>
<br>

## Configuration

### Teammate

Upload the `.env` file from the `.env.vault`.

    npx dotenv-vault@latest pull

login and congrats you have all the secrets🎉

### Public

in the root directory create a `.env` file.

Open `.env` then edit it with your settings. You will need:

> BOT_TOKEN, CLIENT_ID, GUILD_ID, NOTION_TOKEN, NOTION_CHECKIN_DB_ID, NOTION_WORKER_DB_ID, NOTION_TASKS_DB_ID, NOTION_DAYS_DB_ID, NOTION_WEEKS_DB_ID, NOTION_MONTHS_DB_ID

    BOT_TOKEN=<Discord bot token :string>
    CLIENT_ID=<Discord client id :string>
    GUILD_ID=<Discord Guild(server) id :string>
    NOTION_TOKEN=<Notion Integration token :string>
    NOTION_CHECKIN_DB_ID=<Notion Check-in database token :string>
    NOTION_WORKER_DB_ID=<Notion company workers database token :string>
    NOTION_TASKS_DB_ID=<Notion Tasks database token :string>
    NOTION_DAYS_DB_ID=<Notion Days database token :string>
    NOTION_WEEKS_DB_ID=<Notion Weeks database token :string>
    NOTION_MONTHS_DB_ID=<Notion Months database token :string>

<br>
<br>

## Running the project

    npm run start

<br>
<br>
