const { Events, REST, Routes } = require('discord.js');
const { updateCalendar } = require('../utils/contentCalendar');
const { updateDashboard } = require('../utils/dashboard');
const { query } = require('../database/db');
const { startGitHubWebhookServer } = require('../utils/githubWebhook');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    // Database migrations
    await query(`
      ALTER TABLE tasks ALTER COLUMN assigned_user_id DROP NOT NULL;
    `);
    
    await query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT;
    `);

    await query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_department TEXT;
    `);

    const commands = [...client.commands.values()].map((command) =>
      command.data.toJSON()
    );

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash commands registered.');

    await updateDashboard(client);
    console.log('Dashboard initialized.');

    await updateCalendar(client);
    console.log('Calendar initialized.');
    
    setInterval(() => {
      updateCalendar(client);
    }, 60000); // every 60s

    startGitHubWebhookServer(client);
    console.log('GitHub webhook initialized.');
  },
};
