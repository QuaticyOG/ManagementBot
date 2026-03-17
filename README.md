# Discord Task Management Bot

A Railway-ready Discord task manager Bot for PackyGG using Node.js, discord.js v14, PostgreSQL, and Trello API.

## Features

- `/task create` opens a modal for task creation
- Task priorities (High / Medium / Low)
- Task deadlines with timestamp display
- Department-based task routing
- Source tracking (shows which department created the task)
- Assign tasks to users
- PostgreSQL persistence
- Role-based task visibility
- Task buttons for start, complete, and details
- `/tasks` and `/mytasks` listing commands
- Archived tasks system
- Auto-updating project dashboard with contributor leaderboard
- Trello content calendar synced into Discord
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

TRELLO_KEY=
TRELLO_TOKEN=
TRELLO_BOARD_ID=
CONTENT_CALENDAR_CHANNEL_ID=
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

- Set all environment variables in Railway
- Use a Railway PostgreSQL service and paste its `DATABASE_URL`
- Deploy from GitHub
- Start command: `node index.js`
- This project registers **guild slash commands** on startup using `CLIENT_ID` and `GUILD_ID`

## Roles Expected In Discord

- Frontend
- Backend
- Design
- Marketing
- Admin
- Project Manager
- Head of X (treated as Management)

## Commands

### Task

- `/task create`
- `/task assign`

### Task Management

- `/taskpriority`
- `/taskdeadline`

### Task Views

- `/tasks all`
- `/tasks department name:<department>`
- `/tasks user target:@user`
- `/tasks archived`
- `/tasks archived tasknumber:<id>`
- `/mytasks`

### Admin

- `/resettasks`
- `/resetdashboard`

### Info

- `/postuserinfo`
- `/poststaffinfo`
- `/postdashboardinfo`

### Calendar

- `/postcalendar`

## Workflow

- A user creates a task using `/task create`
- The task is routed to the correct department channel
- Staff / Head of dept assigns the task using `/task assign`
- Interact using buttons:
  - Start Task → moves to In Progress
  - Complete Task → moves to Completed
- The dashboard updates automatically
- Completed tasks are archived and viewable with `/tasks archived`

## Notes

- Dashboard updates automatically on every task change
- Content calendar refreshes every 60 seconds
- All bot responses use embeds

## Author

Built by [Quaticy](https://www.quaticy.com/Home)

## License & Usage

This software is developed for [**PackyGG**](https://x.com/packygg) by [**Quaticy**](https://www.quaticy.com/Home) and is intended solely for their internal use.

Unauthorized use, reproduction, distribution, or deployment is strictly prohibited.

For licensing or usage inquiries, please contact PackyGG or the developer.
