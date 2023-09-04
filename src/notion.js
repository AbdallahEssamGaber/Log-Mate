require("dotenv").config();
const { Client } = require("@notionhq/client");
const { timeLog, error } = require("console");

var moment = require("moment"); // require
moment().format();
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const { NOTION_CHECKIN_DB_ID, NOTION_MEMBERS_DB_ID, NOTION_MASTERTL_DB_ID } =
  process.env;

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

const isAval = async (fields) => {
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

const getTaskId = async (fields, id) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MASTERTL_DB_ID,
      filter: {
        and: [
          {
            property: "Team Member Relation",
            relation: {
              contains: id,
            },
          },
          {
            property: "Team Member",
            rollup: {
              any: {
                rich_text: {
                  equals: fields.name,
                },
              },
            },
          },
        ],
      },
      sorts: [
        {
          property: "Created time",
          direction: "descending",
        },
      ],
    });
    if (!response.results.length) {
      console.error("COULDN'T FIND TASK ID PAGE");
    }
    return response.results[0].id;
  } catch (error) {
    console.error(error.body);
  }
};

//create a notion page
module.exports.createCheckIn = async (fields) => {
  try {
    //the id for the rollup db for the team
    let id = await isAval(fields);

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_CHECKIN_DB_ID,
      },
      properties: {
        "today work": {
          title: [
            {
              text: {
                content: fields.todayWork,
              },
            },
          ],
        },
        "Team Member Relation": {
          relation: [
            {
              id: id,
            },
          ],
        },
        blockers: {
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
  } catch (error) {
    console.error(error.body);
  }
};

module.exports.createTask = async (fields) => {
  try {
    //the id for the rollup db
    let id = await isAval(fields);

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_MASTERTL_DB_ID,
      },
      properties: {
        Task: {
          title: [
            {
              text: {
                content: fields.taskName,
              },
            },
          ],
        },
        "Start Time": {
          date: {
            start: fields.startTime,
            end: null,
            time_zone: "Africa/Cairo",
          },
        },
        "End Time": {
          date: {
            start: fields.endTime,
            end: null,
            time_zone: "Africa/Cairo",
          },
        },
        "Team Member Relation": {
          relation: [
            {
              id: id,
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

module.exports.updateTask = async (fields) => {
  console.log("INSIDE.");

  try {
    //the id for the rollup db
    let id = await isAval(fields);
    let pageId = await getTaskId(fields, id);
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        "Start Time": {
          date: {
            start: fields.startTime,
            end: null,
            time_zone: "Africa/Cairo",
          },
        },
        "End Time": {
          date: {
            start: fields.endTime,
            end: null,
            time_zone: "Africa/Cairo",
          },
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error.body);
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
