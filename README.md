# Discord Task Management Bot

A Railway-ready Discord task manager Bot for PackyGG using Node.js, discord.js v14, and PostgreSQL.

## Features

- `/task create` opens a modal for task creation
- Department-based task routing
- PostgreSQL persistence
- Role-based task visibility
- Task buttons for start, complete, and details
- `/tasks` and `/mytasks` listing commands
- Auto-updating project dashboard with contributor leaderboard
- Environment-variable based config for Railway deployment

## Project Structure

```text
/commands
/events
/database
/utils
/config
/index.js
```

## Required Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DISCORD_TOKEN=
CLIENT_ID=
GUILD_ID=
DATABASE_URL=
FRONTEND_TASK_CHANNEL_ID=
BACKEND_TASK_CHANNEL_ID=
DESIGN_TASK_CHANNEL_ID=
MARKETING_TASK_CHANNEL_ID=
PROJECT_DASHBOARD_CHANNEL_ID=
```

## Install

```bash
npm install
```

## Start

```bash
node index.js
```

## Railway Notes

- Set all environment variables in Railway.
- Use a Railway PostgreSQL service and paste its `DATABASE_URL` into the bot service.
- Deploy from GitHub with the start command `node index.js`.
- This project registers **guild slash commands** on startup using `CLIENT_ID` and `GUILD_ID`.

## Roles Expected In Discord

- Frontend
- Backend
- Design
- Marketing
- Admin
- Project Manager

## Commands

- `/task create`
- `/tasks all`
- `/tasks department name:<department>`
- `/tasks user target:@user`
- `/tasks archived`
- `/mytasks`
