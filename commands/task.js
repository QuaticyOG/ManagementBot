const { SlashCommandBuilder } = require('discord.js');
const { buildCreateTaskModal } = require('../utils/components');
const { buildInfoEmbed } = require('../utils/embeds');
const { canCreateTasks } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('task')
    .setDescription('Task commands')

    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Open the task creation modal')
    )

    .addSubcommand((subcommand) =>
      subcommand
        .setName('assign')
        .setDescription('Assign a user to a task')
        .addIntegerOption(option =>
          option
            .setName('task_id')
            .setDescription('Task number')
            .setRequired(true)
        )
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User to assign')
            .setRequired(true)
        )
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {

      if (!canCreateTasks(interaction.member)) {
        return interaction.reply({
          embeds: [buildInfoEmbed('Access denied', 'You do not have permission to create tasks.', 0xed4245)],
          ephemeral: true,
        });
      }

      await interaction.showModal(buildCreateTaskModal());
      return;
    }

    // assign command handled in interactionCreate.js
  },
};
