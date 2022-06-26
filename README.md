# Exnota

Save web highlights to Notion.

Chrome and Firefox extension with supporting Netlify Functions API.

## Permissions
- Storage - Saving config

## Debugging functions in VSCode
1. Create a `.env` file with the neccessary environment variables (don't commit this file), e.g.
```
NOTION_CLIENT_ID=<client id>
NOTION_INTEGRATION_SECRET=<secret>
NETLIFY_FUNCTIONS_BASE=http://localhost:9999/.netlify/functions/
```

2. Open the Run and Debug sidebar and select `netlify functions:serve`

Tips
- To make a single function unavailable for testing purposes, rename the folder. E.g. `get-token` to `get-token2`