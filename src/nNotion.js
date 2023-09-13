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
            checkbox: {
              does_not_equal: true,
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
    if (!response.results.length) {
      console.log("there is no tasks at all.");
      return null;
    }
    let tasks = {};
    for (const result of response.results) {
      const memberName =
        result.properties[NOTION_TASKS_NAME_WORKERROLLUP].rollup.array[0]
          .title[0].text.content;
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
