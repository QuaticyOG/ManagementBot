const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { getTaskById } = require('../database/tasks');
const { buildInfoEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taskdeadline')
    .setDescription('Set task deadline')
    .addIntegerOption(o =>
      o.setName('tasknumber')
        .setDescription('Task ID')
        .setRequired(true))
    .addStringOption(o =>
      o.setName('date')
        .setDescription('YYYY-MM-DD')
        .setRequired(true)),

  async execute(interaction) {

    const id = interaction.options.getInteger('tasknumber');
    const date = interaction.options.getString('date');

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return interaction.reply({
        embeds:[buildInfoEmbed("Invalid Date","Use YYYY-MM-DD",0xed4245)],
        ephemeral:true
      });
    }

    await query(
      `UPDATE tasks SET deadline=$1 WHERE id=$2`,
      [parsed, id]
    );

    return interaction.reply({
      embeds:[
        buildInfoEmbed(
          "Deadline Updated",
          `Task **#${id}** deadline set to **${date}**`,
          0x57f287
        )
      ]
    });
  }
};
