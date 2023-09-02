require("dotenv").config();
const { Client } = require("@notionhq/client");

var moment = require("moment"); // require
moment().format();
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const { NOTION_CHECKIN_DB_ID, NOTION_MEMBERS_DB_ID, NOTION_MASTERTL_DB_ID } =
  process.env;

const createMember = async (name) => {
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
                content: name,
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

const isAval = async (name) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MEMBERS_DB_ID,
      filter: {
        property: "Name",
        rich_text: {
          equals: name,
        },
      },
    });
    if (!response.results.length) {
      return await createMember(name);
    }

    return response.results[0].id;
  } catch (error) {
    console.error(error.body);
  }
};

//create a notion page
module.exports.createCheckIn = async (fields) => {
  try {
    //the id for the rollup db
    let id = await isAval(fields.name);

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
        "Discord Username": {
          rich_text: [
            {
              text: {
                content: fields.username,
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
    let id = await isAval(fields.name);

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
      const name = item.properties.Name.title[0].plain_text
        ? item.properties.Name.title[0].plain_text
        : null;
      if (!name) continue;
      const date = await fetchTasks(name);
      if (!date) {
        teamObj[name] = true;
        continue;
      }
      const diff = moment(date).fromNow().split(" ");
      if (diff.includes("hours") && parseInt(diff[0]) >= 4)
        teamObj[name] = true;
      else teamObj[name] = false;
    }
    return teamObj;
  } catch (error) {
    console.error(error.body);
  }
};
