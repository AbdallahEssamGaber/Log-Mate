# Daily-Check-In _-v0.1_

<p align="center">
<img src="https://i.imgur.com/sSqTu56.png" height="200px">
  
<h3 align="center"> A discord bot consuming Notion API to add a check-in data for Notion databases. </h3>
</p>

Check-In for workers over Discord using NodeJS Express NotionAPI and DiscordAPI

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

---

For development, you will need <ins>**[Node.js](https://nodejs.org/)**</ins> and the <ins>**[npm](https://npmjs.org/)**</ins> node global package installed and ready in your environement.
<br>

### Create a Notion Database

---

1. Create a new [Integration](https://www.notion.so/my-integrations). To link it with your database. Don't forget to copy the integration secret to use later. _[docs if you're stuck!](https://developers.notion.com/docs/create-a-notion-integration#getting-started)_
2. Create a new notion database with the same properties below and link the integration with the database. _[docs if you're stuck!](https://developers.notion.com/docs/create-a-notion-integration#give-your-integration-page-permissions)_
   <img src="https://i.imgur.com/Fzn9tFo.png" title="source: imgur.com" />
   <br>

### Create a Discord Bot

---

Check that [simple guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to do so

<br>
<br>

## Install

---

    $ git clone https://github.com/AbdallahEssamGaber/daily-check-in
    $ cd daily-check-in
    $ npm install

<br>
<br>

## Configuration

---

in the root directory create a `.env` file.

Open `.env` then edit it with your settings. You will need:

> BOT_TOKEN, CLIENT_ID, GUILD_ID, NOTION_TOKEN, NOTION_DB_ID

    BOT_TOKEN=<Discord bot token :string>
    CLIENT_ID=<Discord client id :string>
    GUILD_ID=<Discord Guild(server) id :string>
    NOTION_TOKEN=<Notion Integration token :string>
    NOTION_DB_ID=<Notion database token :string>

<br>
<br>

## Running the project

---

    npm run start

<br>
<br>

## Folder Structure

---

`index.js` &#8594; The base file.

`src/notoin.js` &#8594; Notion Auth file and creating a page code.

`src/discord/commands` &#8594; All the commands info to use

`src/discord/events` &#8594; All the events listener to handle the commands

`src/discord/configuration` &#8594; The kick-start to everything (initialize, login and deploy)
