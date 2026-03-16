const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../database/db');
const { getTaskById } = require('../database/tasks');
const { buildInfoEmbed, buildTaskEmbed } = require('../utils/embeds');
const { buildTaskButtons } = require('../utils/components');
const { getDepartmentChannelId } = require('../utils/channelRouter');
const { updateDashboard } = require('../utils/dashboard');

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
          { name: "High", value: "high" },
          { name: "Medium", value: "medium" },
          { name: "Low", value: "low" }
        )),

  async execute(interaction, client) {

    const id = interaction.options.getInteger("tasknumber");
    const priority = interaction.options.getString("priority");

    /* Update database */
    await query(
      `UPDATE tasks SET priority=$1 WHERE id=$2`,
      [priority, id]
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

    /* Find task message in department channel */
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
          "Priority Updated",
          `Task **#${id}** priority set to **${priority}**`,
          0x57f287
        )
      ]
    });

  }
};
