const { SlashCommandBuilder } = require('discord.js');
const { listTasks } = require('../database/tasks');
const { buildTaskListEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mytasks')
    .setDescription('Show tasks assigned to you'),

  async execute(interaction) {
    const tasks = await listTasks({ assignedUserId: interaction.user.id, statuses: ['todo', 'in_progress', 'completed'] });
    await interaction.reply({
      embeds: [buildTaskListEmbed({ title: 'My Tasks', tasks, requestingUserId: interaction.user.id })],
      ephemeral: true,
    });
  },
};
