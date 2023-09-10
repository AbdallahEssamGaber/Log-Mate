require("dotenv").config();
const { Client } = require("@notionhq/client");
const { timeLog, error } = require("console");
const { REST } = require("discord.js");

var moment = require("moment"); // require
moment().format();
const {
  NOTION_TOKEN,
  NOTION_CHECKIN_DB_ID,
  NOTION_MEMBERS_DB_ID,
  NOTION_TASKS_DB_ID,
  NOTION_CHECKIN_TAG_MEMBER,
  NOTION_CHECKIN_TAG_BLOCKERS,
  NOTION_MEMBERS_TAG_USERID,
  NOTION_MEMBERS_TAG_USERNAME,
  NOTION_TASKS_TAG_MEMBER,
  NOTION_TASKS_TAG_STTIME,
  NOTION_TASKS_TAG_ENTIME,
  NOTION_TASKS_TAG_CHECKS,
  NOTION_TAG_NAME,
} = process.env;

const notion = new Client({
  auth: NOTION_TOKEN,
});

const createMember = async (fields) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_MEMBERS_DB_ID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: fields.name,
              },
            },
          ],
        },
        "Discord Username": {
          rich_text: [
            {
              text: {
                content: fields.username,
              },
            },
          ],
        },
        "Discord UserId": {
          rich_text: [
            {
              text: {
                content: fields.userId,
              },
            },
          ],
        },
      },
    });
    return response.id;
  } catch (error) {
    console.error(error.body);
  }
};

const isAvail = async (fields) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MEMBERS_DB_ID,
      filter: {
        property: "Name",
        rich_text: {
          equals: fields.name,
        },
      },
    });
    if (!response.results.length) {
      return await createMember(fields);
    }

    return response.results[0].id;
  } catch (error) {
    console.error(error.body);
  }
};

const createCheckIn = async (memberID, checkName, fields) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_CHECKIN_DB_ID,
      },
      properties: {
        [NOTION_TAG_NAME]: {
          title: [
            {
              text: {
                content: checkName,
              },
            },
          ],
        },
        [NOTION_CHECKIN_TAG_MEMBER]: {
          relation: [
            {
              id: memberID,
            },
          ],
        },
        [NOTION_CHECKIN_TAG_BLOCKERS]: {
          rich_text: [
            {
              text: {
                content: fields.blockers,
              },
            },
          ],
        },
      },
    });
    console.log(response);
    return response.id;
  } catch (error) {
    console.error(error.body);
  }
};

const createTask = async (memberID, checkID, taskName) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_TASKS_DB_ID,
      },
      properties: {
        [NOTION_TAG_NAME]: {
          title: [
            {
              text: {
                content: taskName,
              },
            },
          ],
        },
        [NOTION_TASKS_TAG_MEMBER]: {
          relation: [
            {
              id: memberID,
            },
          ],
        },
        [NOTION_TASKS_TAG_CHECKS]: {
          relation: [
            {
              id: checkID,
            },
          ],
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error.body);
  }
};

const createCheckInTasks = async (fields) => {
  try {
    //the id for the rollup db for the team member
    const memberID = await isAvail(fields);
    let date = new Date().toLocaleDateString("en-GB");
    date = date
      .replace(date.substring(6), date.slice(-2))
      .replace(/(^|\/)0+/g, "$1");
    const checkName = fields.name + " Check in " + date;
    const checkID = await createCheckIn(memberID, checkName, fields);
    fields.todayWorks = fields.todayWorks.split("\n");
    for (let i = 0; i < fields.todayWorks.length; i++) {
      await createTask(memberID, checkID, fields.todayWorks[i]);
    }
  } catch (error) {
    console.error(error);
  }
};

// FETCH ALL THE IDS OF THE TEAM.
const fetchTeamIds = async () => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MEMBERS_DB_ID,
    });
    return response.results;
  } catch (error) {
    console.error(error.body);
  }
};

// CHECK EACH ID ITEM WITHIN THE MASTERTL
const fetchTasks = async (name) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MASTERTL_DB_ID,
      filter: {
        property: "Team Member",
        rollup: {
          any: {
            rich_text: {
              equals: name,
            },
          },
        },
      },
      sorts: [
        {
          property: "Created time",
          direction: "descending",
        },
      ],
    });
    const result = response.results[0].properties["End Time"].date.start
      ? response.results[0].properties["End Time"].date.start
      : null;

    return result;
    // console.log(response.results[0].properties.Task);
  } catch (error) {
    console.error(error.body);
  }
};

module.exports.notionPreReminder = async () => {
  try {
    const teamObj = {};
    const teamIDs = await fetchTeamIds();
    for (const item of teamIDs) {
      const title = item.properties.Name.title[0];
      const richText = item.properties["Discord UserId"].rich_text[0];
      const name = title ? title.plain_text : null;
      const discordUsername = richText ? richText.plain_text : null;

      if (!name) continue;
      const date = await fetchTasks(name);
      if (!discordUsername) {
        console.error(`username not aval in Notion for ${name}`);
        continue;
      }
      if (!date) {
        teamObj[discordUsername] = true;
        continue;
      }
      const diff = moment(date).fromNow().split(" ");
      if (
        diff.includes("hours") &&
        (parseInt(diff[0]) >= 4 || parseInt(diff[1]) >= 4)
      )
        teamObj[discordUsername] = true;
      else teamObj[discordUsername] = false;
    }
    return teamObj;
  } catch (error) {
    console.error(error.body);
  }
};

module.exports = { createCheckInTasks };
