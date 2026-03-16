const { SlashCommandBuilder } = require('discord.js');
const { getTaskById } = require('../database/tasks');
const { query } = require('../database/db');
const { buildInfoEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taskedit')
    .setDescription('Edit a task')
    .addIntegerOption(o =>
      o.setName('tasknumber')
        .setDescription('Task ID')
        .setRequired(true))
    .addStringOption(o =>
      o.setName('title')
        .setDescription('New title')
        .setRequired(false))
    .addStringOption(o =>
      o.setName('description')
        .setDescription('New description')
        .setRequired(false)),

  async execute(interaction) {

    const id = interaction.options.getInteger('tasknumber');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');

    const task = await getTaskById(id);

    if (!task) {
      return interaction.reply({
        embeds:[buildInfoEmbed("Task not found","No task with that ID exists.",0xed4245)],
        ephemeral:true
      });
    }

    await query(
      `UPDATE tasks
       SET title = COALESCE($1,title),
           description = COALESCE($2,description)
       WHERE id = $3`,
      [title, description, id]
    );

    return interaction.reply({
      embeds:[
        buildInfoEmbed(
          "Task Updated",
          `Task **#${id}** has been updated.`,
          0x57f287
        )
      ],
      ephemeral:true
    });
  }
};
