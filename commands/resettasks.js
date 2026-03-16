const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { buildInfoEmbed } = require('../utils/embeds');
const { updateDashboard } = require('../utils/dashboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resettasks')
    .setDescription('Delete all tasks'),

  async execute(interaction, client) {

    // Permission check
    if (!interaction.member.roles.cache.some(r =>
      ['Admin', 'Project Manager'].includes(r.name)
    )) {
      return interaction.reply({
        embeds: [
          buildInfoEmbed(
            'Access denied',
            'Only **Admins** or **Project Managers** can reset tasks.',
            0xed4245
          ),
        ],
        ephemeral: true,
      });
    }

    // Delete tasks
    await query(`DELETE FROM tasks`);

    // Update dashboard
    await updateDashboard(client);

    // Confirmation message
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
