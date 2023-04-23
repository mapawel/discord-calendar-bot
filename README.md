# Calendar Bot App
### backend app for Discord to book and schedule meetings

#### This App uses:
- TS in Nest (Nodejs), Object Oriented Programming
- Auth0 as authentication and authorization service (SSO) - login via Google or Discord
- Axios
- PostgreSQL and Sequelize
- Integration with Google Calendars
- Discord Bot Interactions (via REST)
- Class Validator
- Jest for unit tests

> tests in progress... Then the app will be deployed on AWS

### Installation:
you need to:
- have Docker installed
- habe Ngrok installed globally
- have Auth0 account
- Discord Application installed
- have Google Console account
- populate all credentials and data accordint to `.env.*.example`
- there is pgAdmin in Docker Container installed on port 5050, which you can use

then in app folder:
`docker compose up -d`

then in terminal:
`ngrok http 6000`
to tunnel the local to outside world

then copy your external https address which is ngrok tunnel to your local and paste it in some places:
- .env
- into your Discord Application Settings -> INTERACTIONS ENDPOINT URL <https address>/interactions
- into your Auth0 application which is your SSO as Allowed Callbacks URLs -> <https address>/auth/callback

(refreshing Docker container may me needed)

### Usage:
- use discord commands, i.e. /authenticate, /get-a-meeting interacting with the bot via Discord
- to setup the bot via Discord interactions, use /manage-bot command
- be aware, there is auth flow for each command, which you can change in the code: commands.list.ts
- by default a roles of Calendar-bot-admin or Mentor allow to /manage-bot
- the easiest way to run /manage-bot is to assign one of the role to discord user as above
- later on you can change role names - remember to change it also (names only) in the code: commands.list.ts or other files in "app-SETUP" folder
- to allow users book meetings, remember that Mentors have to set a google calendar with a name set in "settings.ts" file

------------
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="130" alt="Nest Logo" /></a><a href="https://www.docker.com/" target="blank"><img src="https://logowik.com/content/uploads/images/301_docker.jpg" width="200" alt="Docker Logo" /></a><a href="https://auth0.com/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Logo_de_Auth0.svg/2560px-Logo_de_Auth0.svg.png" width="250" alt="Auth0 Logo" /></a>  <a href="https://discord.com/" target="blank"><img src="https://cdn.worldvectorlogo.com/logos/discord-4.svg" width="100" alt="Discord Logo" /></a> <a href="https://console.cloud.google.com/" target="blank"><img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" width="150" alt="Google Logo" /></a>
</p>
