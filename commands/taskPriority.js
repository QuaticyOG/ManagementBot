const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { buildInfoEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taskpriority')
    .setDescription('Change task priority')
    .addIntegerOption(o =>
      o.setName('tasknumber')
        .setDescription('Task ID')
        .setRequired(true))
    .addStringOption(o =>
      o.setName('priority')
        .setDescription('Priority level')
        .setRequired(true)
        .addChoices(
          {name:"High",value:"high"},
          {name:"Medium",value:"medium"},
          {name:"Low",value:"low"}
        )),

  async execute(interaction){

    const id = interaction.options.getInteger("tasknumber");
    const priority = interaction.options.getString("priority");

    await query(
      `UPDATE tasks SET priority=$1 WHERE id=$2`,
      [priority,id]
    );

    return interaction.reply({
      embeds:[
        buildInfoEmbed(
          "Priority Updated",
          `Task **#${id}** priority set to **${priority}**`,
          0x57f287
        )
      ]
    });
  }
};
