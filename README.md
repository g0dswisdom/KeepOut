# 🌐 KeepOut
KeepOut is a simple webhook security service created in TypeScript.

It also features a discord bot so you can create your webhooks easily.

# 📜 Features
KeepOut has these features:
  - Customizable
  - Blocks mentions
  - Blocks invites
  - Logs restricted actions to DMs
  - Blacklist any keyword
    
The KeepOut Discord bot has these commands:
  - /create `<webhook: string> <blockMentions: boolean> <blockInvites: boolean> <logActions: boolean>` - Creates a new secured webhook
  - /erase `<webhookHash: string>` - Deletes the given secured webhook from the database
  - /message `<webhook: string> <content: string>`- Used for testing purposes
# 🌐 Setup
Enter your information (bot token, url, guildid, etc) in src/config.json  

`npm i` to install packages

To run this, I recommend doing `npm run dev` in the console.
