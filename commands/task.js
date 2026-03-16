const { SlashCommandBuilder } = require('discord.js');
const { buildCreateTaskModal } = require('../utils/components');
const { buildInfoEmbed } = require('../utils/embeds');
const { canCreateTasks } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('task')
    .setDescription('Create a task')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Open the task creation modal'),
    ),

  async execute(interaction) {
    if (!canCreateTasks(interaction.member)) {
      return interaction.reply({
        embeds: [buildInfoEmbed('Access denied', 'You do not have permission to create tasks.', 0xed4245)],
        ephemeral: true,
      });
    }

    await interaction.showModal(buildCreateTaskModal());
  },
};
