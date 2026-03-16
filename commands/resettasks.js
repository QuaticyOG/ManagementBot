const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { buildInfoEmbed } = require('../utils/embeds');
const { updateDashboard } = require('../utils/dashboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resettasks')
    .setDescription('Delete all tasks'),

  async execute(interaction, client) {

    await query(`DELETE FROM tasks`);

    await updateDashboard(client);

    await interaction.reply({
      embeds: [
        buildInfoEmbed(
          'Tasks Reset',
          'All tasks have been removed from the database.',
          0x57f287
        ),
      ],
      ephemeral: true,
    });

  },
};
