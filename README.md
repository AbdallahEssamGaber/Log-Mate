# Daily-Check-In _-v0.2_

<p align="center">
<img src="https://i.imgur.com/sSqTu56.png" height="200px">
  
<h3 align="center"> A discord bot consuming Notion API to add a check-in/out data for Notion databases. </h3>
</p>

Check-In/out for workers over Discord using NodeJS Express NotionAPI and DiscordAPI

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
2. Create new notion databases with the same properties (from the code) and link the integration with the all databases. _[docs if you're stuck!](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions)_
   <br>

### Create a Discord Bot

Check that [simple guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to do so

<br>
<br>

## Install

    $ git clone https://github.com/AbdallahEssamGaber/daily-check-in
    $ cd daily-check-in
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

> BOT_TOKEN, CLIENT_ID, GUILD_ID, NOTION_TOKEN, NOTION_CHECKIN_DB_ID, NOTION_MEMBERS_DB_ID, NOTION_CHECKOUT_DB_ID

    BOT_TOKEN=<Discord bot token :string>
    CLIENT_ID=<Discord client id :string>
    GUILD_ID=<Discord Guild(server) id :string>
    NOTION_TOKEN=<Notion Integration token :string>
    NOTION_CHECKIN_DB_ID=<Notion Check-in database token :string>
    NOTION_MEMBERS_DB_ID=<Notion company workers database token :string>
    NOTION_CHECKOUT_DB_ID=<Notion Check-out database token :string>

<br>
<br>

## Running the project

    npm run start

<br>
<br>

## Folder Structure

`index.js` &#8594; The base file.

`src/notoin.js` &#8594; Notion Auth file and creating a page code.

`src/general_modules` &#8594; Local created modules to help me along the way.

`src/discord/commands` &#8594; All the commands info to use

`src/discord/events` &#8594; All the events listener to handle the commands

`src/discord/configuration` &#8594; The kick-start to everything (initialize, login and deploy)
