require("dotenv").config();
const { Client } = require("@notionhq/client");

const {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} = require("date-fns");
const cron = require("cron");

const {
  NOTION_TOKEN,
  NOTION_CHECKIN_DB_ID,
  NOTION_WORKER_DB_ID,
  NOTION_TASKS_DB_ID,
  NOTION_DAYS_DB_ID,
  NOTION_WEEKS_DB_ID,
  NOTION_MONTHS_DB_ID,
} = process.env;

const NOTION_CHECKIN_TAG_MEMBER = "Worker";
const NOTION_CHECKIN_TAG_DAY = "Day";
const NOTION_CHECKIN_TAG_WEEK = "Week";
const NOTION_CHECKIN_TAG_MONTH = "Month";
const NOTION_CHECKIN_TAG_BLOCKERS = "blockers";
const NOTION_WORKER_TAG_USERNAME = "Discord Username";
const NOTION_WORKER_TAG_POSITIONLABEL = "Position Label";
const NOTION_WORKER_TAG_TEAMLABEL = "Team Label";
const NOTION_TASKS_TAG_MEMBER = "Workers";
const NOTION_TASKS_TAG_STTIME = "Start Time";
const NOTION_TASKS_TAG_ENTIME = "End Time";
const NOTION_TASKS_TAG_CHECKS = "Checks";
const NOTION_TASKS_TAG_DONE = "Done?";
const NOTION_TASKS_TAG_DAY = "Day";
const NOTION_TASKS_TAG_WEEK = "Week";
const NOTION_TASKS_TAG_MONTH = "Month";
const NOTION_TAG_DISCORDUSERID = "Discord UserID";
const NOTION_TAG_NAME = "title";
const NOTION_TAG_PROJECT = "Project";
const NOTION_TAG_CREATEDTIME = "Created time";
const NOTION_TIMEZONE = "Africa/Cairo";
const notion = new Client({
  auth: NOTION_TOKEN,
});
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
        database_id: NOTION_WORKER_DB_ID,
      },
      icon: {
        type: "external",
        external: {
          url: "https://www.notion.so/icons/user-circle_blue.svg",
        },
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
        [NOTION_WORKER_TAG_USERNAME]: {
          rich_text: [
            {
              text: {
                content: fields.username,
              },
            },
          ],
        },
        [NOTION_TAG_DISCORDUSERID]: {
          rich_text: [
            {
              text: {
                content: fields.userId,
              },
            },
          ],
        },
        [NOTION_WORKER_TAG_POSITIONLABEL]: {
          rich_text: [
            {
              text: {
                content: "Position",
              },
            },
          ],
        },
        [NOTION_WORKER_TAG_TEAMLABEL]: {
          rich_text: [
            {
              text: {
                content: "Team",
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
      database_id: NOTION_WORKER_DB_ID,
      filter: {
        property: NOTION_TAG_DISCORDUSERID,
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

const fetchCheckIn = async (memberID) => {
  try {
    const date = format(new Date(), "yyyy-MM-dd");
    const response = await notion.databases.query({
      database_id: NOTION_CHECKIN_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_CREATEDTIME,
            date: {
              equals: date,
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

const createCheckIn = async (
  memberID,
  checkName,
  fields,
  dayPageID,
  weekPageID,
  monthPageID
) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_CHECKIN_DB_ID,
      },
      icon: {
        type: "external",
        external: {
          url: "https://www.notion.so/icons/arrivals_blue.svg",
        },
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
        [NOTION_TAG_CREATEDTIME]: {
          date: {
            start: new Date().toISOString(),
          },
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
        [NOTION_CHECKIN_TAG_DAY]: {
          relation: [
            {
              id: dayPageID,
            },
          ],
        },
        [NOTION_CHECKIN_TAG_WEEK]: {
          relation: [
            {
              id: weekPageID,
            },
          ],
        },
        [NOTION_CHECKIN_TAG_MONTH]: {
          relation: [
            {
              id: monthPageID,
            },
          ],
        },
      },
    });
    console.log(response);
    return response.id;
  } catch (error) {
    console.error(error);
  }
};

const createTask = async (
  memberID,
  checkID,
  taskName,
  dayPageID,
  weekPageID,
  monthPageID
) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_TASKS_DB_ID,
      },
      icon: {
        type: "external",
        external: {
          url: "https://www.notion.so/icons/checklist_blue.svg",
        },
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
        [NOTION_TASKS_TAG_DAY]: {
          relation: [
            {
              id: dayPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_WEEK]: {
          relation: [
            {
              id: weekPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_MONTH]: {
          relation: [
            {
              id: monthPageID,
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

const getDayId = async () => {
  try {
    const date = format(new Date(), "yyyy-MM-dd");
    const response = await notion.databases.query({
      database_id: NOTION_DAYS_DB_ID,
      filter: {
        property: "Created time",
        date: {
          equals: date,
        },
      },
    });
    if (!response.results.length) return null;
    return response.results[0].id;
  } catch (error) {
    console.error(error);
  }
};
const getWeekId = async () => {
  try {
    const date = new Date(); // get current date
    const startOfWeekDate = format(
      startOfWeek(date, { weekStartsOn: 6 }),
      "yyyy-MM-dd"
    );
    const endOfWeekDate = format(endOfWeek(date), "yyyy-MM-dd");
    const response = await notion.databases.query({
      database_id: NOTION_WEEKS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_CREATEDTIME,
            date: {
              on_or_after: startOfWeekDate,
            },
          },
          {
            property: NOTION_TAG_CREATEDTIME,
            date: {
              on_or_before: endOfWeekDate,
            },
          },
        ],
      },
    });
    if (!response.results.length) return null;
    return response.results[0].id;
  } catch (error) {
    console.error(error);
  }
};

const getMonthId = async () => {
  try {
    const date = new Date();
    const firstDay = format(startOfMonth(date), "yyyy-MM-dd");
    const lastDay = format(endOfMonth(date), "yyyy-MM-dd");
    const response = await notion.databases.query({
      database_id: NOTION_MONTHS_DB_ID,
      filter: {
        and: [
          {
            property: NOTION_TAG_CREATEDTIME,
            date: {
              on_or_before: lastDay,
            },
          },
          {
            property: NOTION_TAG_CREATEDTIME,
            date: {
              on_or_after: firstDay,
            },
          },
        ],
      },
    });

    if (!response.results.length) return null;
    return response.results[0].id;
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  try {
    new cron.CronJob("0 0 9 * * *", async () => {
      const dayPageID = await getDayId();
      const weekPageID = await getWeekId();
      const monthPageID = await getMonthId();
      const response = await notion.pages.update({
        page_id: dayPageID,
        properties: {
          Weeks: {
            relation: [
              {
                id: weekPageID,
              },
            ],
          },
          Months: {
            relation: [
              {
                id: monthPageID,
              },
            ],
          },
        },
      });
      console.log(response);
    });
  } catch (error) {
    console.error(error);
  }
})();

(async () => {
  try {
    new cron.CronJob("0 0 8 * * 6", async () => {
      const dayPageID = await getDayId();
      const weekPageID = await getWeekId();
      const monthPageID = await getMonthId();
      const response = await notion.pages.update({
        page_id: dayPageID,
        properties: {
          Weeks: {
            relation: [
              {
                id: weekPageID,
              },
            ],
          },
          Months: {
            relation: [
              {
                id: monthPageID,
              },
            ],
          },
        },
      });
      console.log(response);
    });
  } catch (error) {
    console.error(error);
  }
})();

const createCheckInTasks = async (fields) => {
  try {
    //the id for the rollup db for the team member
    let memberID = await isAvail(fields);
    while (memberID === undefined) {
      memberID = await isAvail(fields);
    }
    let date = format(new Date(), "d/M/yy");
    const checkName = fields.name + " Check in " + date;
    let dayPageID = await getDayId();
    while (dayPageID === undefined) {
      dayPageID = await getDayId();
    }

    let weekPageID = await getWeekId();
    while (weekPageID === undefined) {
      weekPageID = await getWeekId();
    }
    let monthPageID = await getMonthId();
    while (monthPageID === undefined) {
      monthPageID = await monthPageID();
    }
    const checkID = await createCheckIn(
      memberID,
      checkName,
      fields,
      dayPageID,
      weekPageID,
      monthPageID
    );
    fields.todayWorks = fields.todayWorks.split("\n");
    for (let i = 0; i < fields.todayWorks.length; i++) {
      await createTask(
        memberID,
        checkID,
        fields.todayWorks[i],
        dayPageID,
        weekPageID,
        monthPageID
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const logTask = async (fields) => {
  try {
    console.log(fields);
    let memberID = await isAvail(fields);
    while (memberID === undefined) {
      memberID = await isAvail(fields);
    }
    if (!memberID) return console.log("User not found.");
    const responseID = await notion.databases.query({
      database_id: NOTION_TASKS_DB_ID,
      filter: {
        or: [
          {
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
                property: NOTION_TAG_NAME,
                rich_text: {
                  equals: fields.taskName,
                },
              },
            ],
          },
          {
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
                property: NOTION_TASKS_TAG_MEMBER,
                relation: {
                  contains: memberID,
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
        ],
      },
    });
    if (!responseID.results.length) return console.log("Task not found.");
    for (let i = 0; i < responseID.results.length; i++) {
      const name = responseID.results[i].properties.Name.title[0].text.content;
      if (name === fields.taskName) {
        let response = await notion.pages.update({
          page_id: responseID.results[i].id,
          properties: {
            Tags: {
              select: {
                name: fields.taskTag,
              },
            },
            [NOTION_TASKS_TAG_STTIME]: {
              date: {
                start: fields.startTimeParsed,
              },
            },
            [NOTION_TASKS_TAG_ENTIME]: {
              date: {
                start: fields.endTimeParsed,
              },
            },
          },
        });
        if (fields.project) {
          response = await notion.pages.update({
            page_id: response.id,
            properties: {
              [NOTION_TAG_PROJECT]: {
                select: {
                  name: fields.project,
                },
              },
            },
          });
        }
        console.log(response);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const addNewTask = async (fields) => {
  try {
    const responseID = await notion.pages.create({
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
      },
    });
    let memberIDForNewTask = await isAvail(fields);
    while (memberIDForNewTask === undefined) {
      memberIDForNewTask = await isAvail(fields);
    }
    let checkIDForNewTasks = await fetchCheckIn(memberIDForNewTask);
    while (checkIDForNewTasks === undefined) {
      checkIDForNewTasks = await fetchCheckIn(memberIDForNewTask);
    }
    if (checkIDForNewTasks == null) {
      console.log("NAH CHECK IN NOT AVAIL");
      return;
    }
    let dayPageID = await getDayId();
    while (dayPageID === undefined) {
      dayPageID = await getDayId();
    }
    let weekPageID = await getWeekId();
    while (weekPageID === undefined) {
      weekPageID = await getWeekId();
    }
    let monthPageID = await getMonthId();
    while (monthPageID === undefined) {
      monthPageID = await monthPageID();
    }
    const response = await notion.pages.update({
      page_id: responseID.id,
      icon: {
        type: "external",
        external: {
          url: "https://www.notion.so/icons/checklist_blue.svg",
        },
      },
      properties: {
        [NOTION_TASKS_TAG_MEMBER]: {
          relation: [
            {
              id: memberIDForNewTask,
            },
          ],
        },
        [NOTION_TASKS_TAG_CHECKS]: {
          relation: [
            {
              id: checkIDForNewTasks,
            },
          ],
        },
        [NOTION_TASKS_TAG_DAY]: {
          relation: [
            {
              id: dayPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_WEEK]: {
          relation: [
            {
              id: weekPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_MONTH]: {
          relation: [
            {
              id: monthPageID,
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

const addLogTask = async (fields) => {
  try {
    let memberID = await isAvail(fields);
    while (memberID === undefined) {
      memberID = await isAvail(fields);
    }
    let checkID = await fetchCheckIn(memberID);
    while (checkID === undefined) {
      checkID = await fetchCheckIn(memberID);
    }
    let dayPageID = await getDayId();
    while (dayPageID === undefined) {
      dayPageID = await getDayId();
    }
    let weekPageID = await getWeekId();
    while (weekPageID === undefined) {
      weekPageID = await getWeekId();
    }
    let monthPageID = await getMonthId();
    while (monthPageID === undefined) {
      monthPageID = await monthPageID();
    }
    let response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_TASKS_DB_ID,
      },
      icon: {
        type: "external",
        external: {
          url: "https://www.notion.so/icons/checklist_blue.svg",
        },
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
        Tags: {
          select: {
            name: fields.taskTag,
          },
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
        [NOTION_TASKS_TAG_DAY]: {
          relation: [
            {
              id: dayPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_WEEK]: {
          relation: [
            {
              id: weekPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_MONTH]: {
          relation: [
            {
              id: monthPageID,
            },
          ],
        },
        [NOTION_TASKS_TAG_STTIME]: {
          date: {
            start: fields.startTimeParsed,
          },
        },
        [NOTION_TASKS_TAG_ENTIME]: {
          date: {
            start: fields.endTimeParsed,
          },
        },
      },
    });
    if (fields.project) {
      response = await notion.pages.update({
        page_id: response.id,
        properties: {
          [NOTION_TAG_PROJECT]: {
            select: {
              name: fields.project,
            },
          },
        },
      });
    }
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  tags,
  createCheckInTasks,
  logTask,
  addNewTask,
  addLogTask,
};
