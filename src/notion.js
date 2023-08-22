require("dotenv").config();
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const database_id = process.env.NOTION_DB_ID;

//create a notion page
module.exports = async (fields) => {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: database_id,
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
        "pervious workday": {
          rich_text: [
            {
              text: {
                content: fields.perviousWorkday,
              },
            },
          ],
        },
        "today work": {
          rich_text: [
            {
              text: {
                content: fields.todayWork,
              },
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
