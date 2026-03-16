const { Events, REST, Routes } = require('discord.js');
const { updateDashboard } = require('../utils/dashboard');
const { query } = require('../database/db');

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
    
    await query(`
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deadline TIMESTAMP;
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
  },
};
