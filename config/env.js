const dotenv = require('dotenv');

dotenv.config();

const required = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'DATABASE_URL',
  'FRONTEND_TASK_CHANNEL_ID',
  'BACKEND_TASK_CHANNEL_ID',
  'DESIGN_TASK_CHANNEL_ID',
  'MARKETING_TASK_CHANNEL_ID',
  'PROJECT_DASHBOARD_CHANNEL_ID',
  'WORKERS_TASK_CHANNEL_ID',
  'PACKS_TASK_CHANNEL_ID',
  'BUGTESTER_TASK_CHANNEL_ID',
  'PROJECT_DASHBOARD_CHANNEL_ID',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}
