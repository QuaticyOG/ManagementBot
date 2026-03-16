const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { getTaskById } = require('../database/tasks');

const { buildInfoEmbed, buildTaskEmbed } = require('../utils/embeds');
const { buildTaskButtons } = require('../utils/components');

const { getDepartmentChannelId } = require('../utils/channelRouter');
const { updateDashboard } = require('../utils/dashboard');

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

  async execute(interaction, client) {

    const id = interaction.options.getInteger('tasknumber');
    const date = interaction.options.getString('date');

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      return interaction.reply({
        embeds: [
          buildInfoEmbed("Invalid Date", "Use format **YYYY-MM-DD**", 0xed4245)
        ],
        ephemeral: true
      });
    }

    /* Update database */

    await query(
      `UPDATE tasks SET deadline=$1 WHERE id=$2`,
      [parsed, id]
    );

    /* Fetch updated task */

    const updatedTask = await getTaskById(id);

    if (!updatedTask) {
      return interaction.reply({
        embeds: [
          buildInfoEmbed("Task not found", "That task does not exist.", 0xed4245)
        ],
        ephemeral: true
      });
    }

    /* Find and update task message */

    const channelId = getDepartmentChannelId(updatedTask.department);
    const channel = await client.channels.fetch(channelId);

    if (channel?.isTextBased()) {

      const messages = await channel.messages.fetch({ limit: 50 });

      const taskMessage = messages.find(m =>
        m.embeds.length &&
        m.embeds[0].footer?.text?.includes(`Task ID: ${id}`)
      );

      if (taskMessage) {
        await taskMessage.edit({
          embeds: [buildTaskEmbed(updatedTask)],
          components: [buildTaskButtons(updatedTask)]
        });
      }
    }

    /* Update dashboard */

    await updateDashboard(client);

    return interaction.reply({
      embeds: [
        buildInfoEmbed(
          "Deadline Updated",
          `Task **#${id}** deadline set to **${date}**`,
          0x57f287
        )
      ]
    });

  }
};
