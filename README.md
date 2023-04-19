# Calendar Bot App
### backend app for Discord to book and schedule meetings

#### Used:
- TS in Nest (Nodejs), Object Oriented Programming
- Auth0 as authentication and authorization service (SSO) - login via Google or Discord
- Axios
- SQLite and Sequelize
- Integration with Google Calendars
- Discord Bot Interactions (via REST)
- Class Validator
- Jest for unit tests

> tests in progress... Then the app will be dockerized and deployed on AWS. Now to run you need to use Ngrok for tunneling and your Auth0 credentials

------------



<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    
#### Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

#### Installation

```bash
$ npm install
```

#### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

#### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

