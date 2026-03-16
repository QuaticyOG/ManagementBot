const { SlashCommandBuilder } = require('discord.js');
const { updateDashboard } = require('../utils/dashboard');
const { buildInfoEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetdashboard')
    .setDescription('Rebuild the project dashboard'),

  async execute(interaction, client) {

    // Permission check
    if (!interaction.member.roles.cache.some(r =>
      ['Admin', 'Project Manager'].includes(r.name)
    )) {
      return interaction.reply({
        embeds: [
          buildInfoEmbed(
            'Access denied',
            'Only **Admins** or **Project Managers** can reset the dashboard.',
            0xed4245
          ),
        ],
        ephemeral: true,
      });
    }

    await updateDashboard(client);

    await interaction.reply({
      embeds: [
        buildInfoEmbed(
          'Dashboard Reset',
          'The project dashboard has been rebuilt.',
          0x57f287
        ),
      ],
      ephemeral: true,
    });

  },
};
