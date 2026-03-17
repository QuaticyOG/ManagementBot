const { SlashCommandBuilder } = require('discord.js');
const { updateCalendar } = require('../utils/contentCalendar');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postcalendar')
    .setDescription('Post Trello content calendar'),

  async execute(interaction, client) {
    await updateCalendar(client);

    await interaction.reply({
      content: 'Calendar posted/updated',
      ephemeral: true
    });
  }
};
