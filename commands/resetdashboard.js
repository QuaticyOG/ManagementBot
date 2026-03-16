const { SlashCommandBuilder } = require('discord.js');
const { updateDashboard } = require('../utils/dashboard');
const { buildInfoEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetdashboard')
    .setDescription('Rebuild the project dashboard'),

  async execute(interaction, client) {

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
