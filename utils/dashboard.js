const { EmbedBuilder } = require('discord.js');
const { DEPARTMENTS } = require('../config/departments');
const { getDepartmentSummary, getTopContributors } = require('../database/tasks');
const { getState, setState } = require('../database/state');

function buildDashboardEmbed(summaryRows, topContributors) {
  const summaryMap = new Map(summaryRows.map((row) => [row.department, row]));

  const departmentLines = Object.keys(DEPARTMENTS).map((key) => {
    const department = DEPARTMENTS[key];
    const summary = summaryMap.get(key) || { todo_count: 0, in_progress_count: 0, completed_count: 0 };
    return `**${department.label}**\nTodo: ${summary.todo_count}\nIn Progress: ${summary.in_progress_count}\nCompleted: ${summary.completed_count}`;
  });

  const contributors = topContributors.length
    ? topContributors
        .map((entry, index) => `${index + 1}. <@${entry.assigned_user_id}> — ${entry.completed_count} completed`)
        .join('\n')
    : 'No completed tasks yet.';

  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('Project Dashboard')
    .addFields(
      { name: 'Department Progress', value: departmentLines.join('\n\n') },
      { name: 'Top Contributors', value: contributors },
    )
    .setTimestamp(new Date());
}

async function getOrCreateDashboardMessage(client) {
  const dashboardChannel = await client.channels.fetch(process.env.PROJECT_DASHBOARD_CHANNEL_ID);
  if (!dashboardChannel?.isTextBased()) {
    throw new Error('PROJECT_DASHBOARD_CHANNEL_ID does not point to a text-based channel.');
  }

  const existingId = await getState('dashboard_message_id');
  if (existingId) {
    try {
      return await dashboardChannel.messages.fetch(existingId);
    } catch {
      // ignored, recreated below
    }
  }

  const placeholder = await dashboardChannel.send({
    embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('Project Dashboard').setDescription('Preparing dashboard...')],
  });

  await setState('dashboard_message_id', placeholder.id);
  return placeholder;
}

async function updateDashboard(client) {
  const [summaryRows, topContributors] = await Promise.all([
    getDepartmentSummary(),
    getTopContributors(5),
  ]);

  const dashboardMessage = await getOrCreateDashboardMessage(client);
  const embed = buildDashboardEmbed(summaryRows, topContributors);
  await dashboardMessage.edit({ embeds: [embed], components: [] });
}

module.exports = {
  updateDashboard,
};
