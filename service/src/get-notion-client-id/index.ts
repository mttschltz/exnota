import { Handler } from "@netlify/functions";
import { GetNotionClientIdApiResponse } from "@api/service";



const resultOk = (response: GetNotionClientIdApiResponse) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

const handler: Handler = async (event, context) => {
  return resultOk({ clientId: process.env.NOTION_CLIENT_ID })
};

export { handler };
