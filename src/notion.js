require("dotenv").config();
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const {
  NOTION_CHECKIN_DB_ID,
  NOTION_MEMBERS_DB_ID,
  NOTION_CHECKOUT_DB_ID,
  NOTION_DESCRIPTIONS_DB_ID,
} = process.env;

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

module.exports.createCheckOut = async (fields) => {
  try {
    //the id for the rollup db
    let id = await isAval(fields.name);

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_CHECKOUT_DB_ID,
      },
      properties: {
        Description: {
          title: [
            {
              text: {
                content: fields.description,
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

module.exports.createDescription = async (fields) => {
  try {
    //the id for the rollup team db
    let id = await isAval(fields.name);

    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: NOTION_DESCRIPTIONS_DB_ID,
      },
      properties: {
        Description: {
          title: [
            {
              text: {
                content: fields.description,
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
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error.body);
  }
};
