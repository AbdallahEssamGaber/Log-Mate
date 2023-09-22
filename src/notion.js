require("dotenv").config();
const { Client } = require("@notionhq/client");

var moment = require("moment"); // require
moment().format();
const {
  NOTION_TOKEN,
  NOTION_CHECKIN_DB_ID,
  NOTION_MEMBERS_DB_ID,
  NOTION_TASKS_DB_ID,
  NOTION_DAYS_DB_I,
  NOTION_WEEKS_DB_ID,
  NOTION_MONTHS_DB_ID,
  NOTION_CHECKIN_TAG_MEMBER,
  NOTION_CHECKIN_TAG_USERID,
  NOTION_CHECKIN_TAG_DAY,
  NOTION_CHECKIN_TAG_WEEK,
  NOTION_CHECKIN_tag_MONTH,
  NOTION_CHECKIN_TAG_BLOCKERS,
  NOTION_CHECKIN_TAG_CREATEDTIME,
  NOTION_MEMBERS_TAG_USERID,
  NOTION_MEMBERS_TAG_USERNAME,
  NOTION_MEMBERS_TAG_CREATEDTIME,
  NOTION_TASKS_TAG_MEMBER,
  NOTION_TASKS_TAG_STTIME,
  NOTION_TASKS_TAG_ENTIME,
  NOTION_TASKS_TAG_CHECKS,
  NOTION_TASKS_TAG_CREATEDTIME,
  NOTION_TASKS_TAG_DONE,
  NOTION_TASKS_TAG_DAY,
  notion_tasks_tag_WEEK,
  NOTION_TASKS_TAG_MONTH,
  NOTION_NAME_WORKERROLLUP,
  NOTION_TAG_NAME,
} = process.env;

const notion = new Client({
  auth: NOTION_TOKEN,
});
// const tags = "Slides\nTeacher Guide\nResearch\nLearning\nCourse\nDesign\nReview\nEdits\nPlanning"
const tags = [
  "Slides",
  "Teacher Guide",
  "Research",
  "Learning",
  "Course",
  "Design",
  "Review",
  "Edits",
  "Planning",
];

const createMember = async (fields) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_MEMBERS_DB_ID,
      },
      properties: {
        [NOTION_TAG_NAME]: {
          title: [
            {
              text: {
                content: fields.name,
              },
            },
          ],
        },
        [NOTION_MEMBERS_TAG_USERNAME]: {
          rich_text: [
            {
              text: {
                content: fields.username,
              },
            },
          ],
        },
        [NOTION_MEMBERS_TAG_USERID]: {
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
    console.error(error);
  }
};

const isAvail = async (fields) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_MEMBERS_DB_ID,
      filter: {
        property: NOTION_MEMBERS_TAG_USERID,
        rich_text: {
          equals: fields.userId,
        },
      },
    });
    if (!response.results.length) {
      //it's a check-in
      if (fields["startTime"] === undefined) {
        console.log("creating new member");
        const id = await createMember(fields);
        return id;
      }
      return null;
    }

    return response.results[0].id;
  } catch (error) {
    console.error(error);
  }
};

const fetchCheckIn = async (memberID, fields) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CHECKIN_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_CHECKIN_TAG_CREATEDTIME,
            date: {
              equals: new Date().toISOString().split("T")[0],
            },
          },
          {
            property: NOTION_CHECKIN_TAG_MEMBER,
            relation: {
              contains: memberID,
            },
          },
        ],
      },
    });
    if (!response.results.length) {
      return null;
    }

    return response.results[0].id;
    // return response.id;
  } catch (error) {
    console.error(error);
  }
};

const fetchCheckIns = async (fields) => {
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
      return checkInUsers;
    }
    for (const result of response.results) {
      const workerRollupArray =
        result.properties[NOTION_NAME_WORKERROLLUP].rollup.array;
      if (!workerRollupArray.length) continue;
      checkInUsers.push(workerRollupArray[0].title[0].text.content);
    }
    return checkInUsers;
    // return response.id;
  } catch (error) {
    console.error(error);
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
        // [NOTION_CHECKIN_TAG_DAY]: {
        //   relation: {
        //     id:
        //   }
        // }
      },
    });
    console.log(response);
    return response.id;
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
};

const checkInAvail = async (userId) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_CHECKIN_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_CHECKIN_TAG_USERID,
            rollup: {
              any: {
                rich_text: {
                  contains: userId,
                },
              },
            },
          },
          {
            property: NOTION_CHECKIN_TAG_CREATEDTIME,
            date: {
              equals: new Date().toISOString().split("T")[0],
            },
          },
        ],
      },
    });
    if (response.results.length == 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
  }
};

// const getDayId = async () => {};
// const getWeekId = async () => {};
// const getMonthId = async () => {};

const createCheckInTasks = async (fields) => {
  try {
    //the id for the rollup db for the team member
    const memberID = await isAvail(fields);
    let date = new Date().toLocaleDateString("en-GB");
    date = date
      .replace(date.substring(6), date.slice(-2))
      .replace(/(^|\/)0+/g, "$1");
    const checkName = fields.name + " Check in " + date;
    // const dayPageID = getDayId();
    // const weekPageID = getWeekId();
    // const monthPageID = getMonthId();
    const checkID = await createCheckIn(memberID, checkName, fields);
    fields.todayWorks = fields.todayWorks.split("\n");
    for (let i = 0; i < fields.todayWorks.length; i++) {
      await createTask(memberID, checkID, fields.todayWorks[i]);
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchTasksUsers = async () => {
  try {
    const responseChecks = await notion.databases.query({
      database_id: NOTION_CHECKIN_DB_ID,
      filter: {
        property: NOTION_CHECKIN_TAG_CREATEDTIME,
        date: {
          equals: new Date().toISOString().split("T")[0],
        },
      },
    });
    if (!responseChecks.results.length) {
      return {};
    }
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
      return tasks;
    }
    for (const result of response.results) {
      const workerRollupArray =
        result.properties[NOTION_NAME_WORKERROLLUP].rollup.array;
      if (!workerRollupArray.length) continue;
      const memberName = workerRollupArray[0].title[0].text.content;
      const title = result.properties.Name.title[0].plain_text.replace(
        " ON LOGGING",
        ""
      );
      tasks[memberName] = !tasks[memberName]
        ? [title]
        : (tasks[memberName] = [...tasks[memberName], title]);
    }
    return tasks;
  } catch (error) {
    console.error(error);
  }
};
const logTask = async (fields) => {
  try {
    const memberID = await isAvail(fields);
    if (!memberID) return console.log("User not found.");

    const responseID = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TASKS_TAG_MEMBER,
            relation: {
              contains: memberID,
            },
          },
          {
            property: NOTION_TASKS_TAG_DONE,
            formula: {
              checkbox: {
                does_not_equal: true,
              },
            },
          },
          {
            property: NOTION_TAG_NAME,
            rich_text: {
              equals: fields.taskName,
            },
          },
        ],
      },
    });

    if (!responseID.results.length) return console.log("Task not found.");
    const response = await notion.pages.update({
      page_id: responseID.results[0].id,
      properties: {
        [NOTION_TASKS_TAG_STTIME]: {
          date: {
            start: fields.startTime,
          },
        },
        [NOTION_TASKS_TAG_ENTIME]: {
          date: {
            start: fields.endTime,
          },
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

const fetchTasks = async (name) => {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        property: [NOTION_TASKS_TAG_MEMBER],
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
          property: [NOTION_TASKS_TAG_CREATEDTIME],
          direction: "descending",
        },
      ],
    });
    const result = response.results[0].properties["End Time"].date.start
      ? response.results[0].properties["End Time"].date.start
      : null;

    return result;
  } catch (error) {
    console.error(error);
  }
};

const notionPreReminder = async () => {
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
    console.error(error);
  }
};

const addNewTask = async (fields) => {
  try {
    const memberID = await isAvail(fields);

    const checkID = await fetchCheckIn(memberID, fields);

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
                content: fields.taskName,
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
        Tags: {
          select: {
            name: fields.tag,
          },
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

const highlightTask = async (fields) => {
  try {
    let taskId = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_NAME,
            rich_text: {
              equals: fields.taskName,
            },
          },
          {
            property: NOTION_TASKS_TAG_CREATEDTIME,
            date: {
              equals: new Date().toISOString().split("T")[0],
            },
          },
          {
            property: NOTION_TASKS_TAG_DONE,
            formula: {
              checkbox: {
                does_not_equal: true,
              },
            },
          },
        ],
      },
    });
    if (taskId.results.length === 0) return null;
    const response = await notion.pages.update({
      page_id: taskId.results[0].id,
      properties: {
        [NOTION_TAG_NAME]: {
          title: [
            {
              text: {
                content: fields.taskName + " ON LOGGING",
              },
            },
          ],
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

const deleteHighlighting = async () => {
  try {
    let taskIds = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_NAME,
            rich_text: {
              contains: " ON LOGGING",
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
    if (taskIds.results.length === 0) return null;
    for (const taskId of taskIds.results) {
      const response = await notion.pages.update({
        page_id: taskId.id,
        properties: {
          [NOTION_TAG_NAME]: {
            title: [
              {
                text: {
                  content: taskId.properties.Name.title[0].plain_text.replace(
                    " ON LOGGING",
                    ""
                  ),
                },
              },
            ],
          },
        },
      });
      console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
};

const logHighlightedTask = async (fields) => {
  try {
    let taskId = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_NAME,
            rich_text: {
              contains: " ON LOGGING",
            },
          },
          {
            property: NOTION_TASKS_TAG_CREATEDTIME,
            date: {
              equals: new Date().toISOString().split("T")[0],
            },
          },
          {
            property: "Discord userID",
            rollup: {
              any: {
                rich_text: {
                  contains: fields.userId,
                },
              },
            },
          },
        ],
      },
    });
    if (taskId.results.length === 0) return null;
    const response = await notion.pages.update({
      page_id: taskId.results[0].id,
      properties: {
        [NOTION_TAG_NAME]: {
          title: [
            {
              text: {
                content:
                  taskId.results[0].properties.Name.title[0].plain_text.replace(
                    " ON LOGGING",
                    ""
                  ),
              },
            },
          ],
        },
        [NOTION_TASKS_TAG_STTIME]: {
          date: {
            start: fields.startTime,
          },
        },
        [NOTION_TASKS_TAG_ENTIME]: {
          date: {
            start: fields.endTime,
          },
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  tags,
  checkInAvail,
  createCheckInTasks,
  fetchTasksUsers,
  logTask,
  fetchCheckIns,
  addNewTask,
  highlightTask,
  deleteHighlighting,
  logHighlightedTask,
  notionPreReminder,
};
