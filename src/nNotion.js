require("dotenv").config();
const { Client } = require("@notionhq/client");

// var moment = require("moment"); // require
// moment().format();
const {
  NOTION_TOKEN,
  NOTION_CHECKIN_DB_ID,
  NOTION_MEMBERS_DB_ID,
  NOTION_TASKS_DB_ID,
  NOTION_CHECKIN_TAG_MEMBER,
  NOTION_CHECKIN_TAG_BLOCKERS,
  NOTION_CHECKIN_TAG_CREATEDTIME,
  NOTION_MEMBERS_TAG_USERID,
  NOTION_MEMBERS_TAG_USERNAME,
  NOTION_TASKS_TAG_MEMBER,
  NOTION_TASKS_TAG_STTIME,
  NOTION_TASKS_TAG_ENTIME,
  NOTION_TASKS_TAG_CHECKS,
  NOTION_TASKS_TAG_DONE,
  NOTION_TASKS_TAG_CREATEDTIME,
  NOTION_NAME_WORKERROLLUP,
  NOTION_TAG_NAME,
} = process.env;

const notion = new Client({
  auth: NOTION_TOKEN,
});

const fetchTasksUsers = async () => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TASKS_TAG_DONE,
            formula: {
              checkbox: {
                does_not_equal: true,
              },
            },
          },
          {
            property: NOTION_TASKS_TAG_CREATEDTIME,
            date: {
              equals: new Date().toISOString().split("T")[0],
            },
          },
        ],
      },
    });
    let tasks = {};
    if (!response.results.length) {
      console.log("there is no tasks at all.");
      return tasks;
    }
    for (const result of response.results) {
      const workerRollupArray =
        result.properties[NOTION_NAME_WORKERROLLUP].rollup.array;
      if (!workerRollupArray.length) continue;
      const memberName = workerRollupArray[0].title[0].text.content;
      tasks[memberName] = !tasks[memberName]
        ? [result.properties.Name.title[0].plain_text]
        : (tasks[memberName] = [
            ...tasks[memberName],
            result.properties.Name.title[0].plain_text,
          ]);
    }
    return tasks;
  } catch (error) {
    console.error(error);
  }
};

const fetchCheckIn = async () => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CHECKIN_DB_ID,
      filter: {
        property: NOTION_CHECKIN_TAG_CREATEDTIME,
        date: {
          equals: new Date().toISOString().split("T")[0],
        },
      },
    });
    let checkInUsers = [];
    if (!response.results.length) {
      console.log("No checks for this user.");
      return checkInUsers;
    }
    for (const result of response.results) {
      const workerRollupArray =
        result.properties[NOTION_NAME_WORKERROLLUP].rollup.array;
      if (!workerRollupArray.length) continue;
      checkInUsers.push(workerRollupArray[0].title[0].text.content);
    }
    console.log(checkInUsers);
    return checkInUsers;
    // return response.id;
  } catch (error) {
    console.error(error);
  }
};
