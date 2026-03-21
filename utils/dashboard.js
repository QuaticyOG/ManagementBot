const { EmbedBuilder } = require('discord.js');
const { DEPARTMENTS } = require('../config/departments');
const { getDepartmentSummary, getTopContributors } = require('../database/tasks');
const { getState, setState } = require('../database/state');

function buildProgressBar(completed, total) {
  if (!total) return '░░░░░░░░░░ 0%';

  const percent = Math.round((completed / total) * 100);
  const filled = Math.round(percent / 10);

  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${percent}%`;
}

function buildDashboardEmbed(summaryRows, topContributors) {
  const summaryMap = new Map(summaryRows.map((row) => [row.department, row]));

  const departments = Object.keys(DEPARTMENTS).map((key) => {
    const department = DEPARTMENTS[key];
    const summary = summaryMap.get(key) || {
      todo_count: 0,
      in_progress_count: 0,
      completed_count: 0,
    };

    const total =
      summary.todo_count +
      summary.in_progress_count +
      summary.completed_count;

    const progressBar = buildProgressBar(summary.completed_count, total);

    return {
      name: `${department.roleName}`,
      value:
`🟡 Todo: ${summary.todo_count}
🔵 In Progress: ${summary.in_progress_count}
🟢 Completed: ${summary.completed_count}

${progressBar}`,
      inline: true,
    };
  });

  const totals = summaryRows.reduce(
    (acc, row) => {
      acc.todo += row.todo_count;
      acc.progress += row.in_progress_count;
      acc.completed += row.completed_count;
      return acc;
    },
    { todo: 0, progress: 0, completed: 0 }
  );

  const contributors = topContributors.length
    ? topContributors
        .map((entry, index) => {
          const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
          const medal = medals[index] || '🏅';
          return `${medal} <@${entry.assigned_user_id}> — ${entry.completed_count} tasks`;
        })
        .join('\n')
    : 'No completed tasks yet.';

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📊 Project Dashboard')

    .addFields({
      name: '📈 Overview',
      value:
`🟡 Todo: ${totals.todo}
🔵 In Progress: ${totals.progress}
🟢 Completed: ${totals.completed}`,
      inline: false,
    })

    .addFields({
      name: '━━━━━━━━━━━━━━━━',
      value: '\u200B',
      inline: false,
    })

    .addFields(...departments)

    .addFields({
      name: '━━━━━━━━━━━━━━━━',
      value: '\u200B',
      inline: false,
    })

    .addFields({
      name: '🏆 Top Contributors',
      value: contributors,
      inline: false,
    })

    .setTimestamp(new Date());

  return embed;
}

async function getOrCreateDashboardMessage(client) {
  const dashboardChannel = await client.channels.fetch(
    process.env.PROJECT_DASHBOARD_CHANNEL_ID
  );

  if (!dashboardChannel?.isTextBased()) {
    throw new Error(
      'PROJECT_DASHBOARD_CHANNEL_ID does not point to a text-based channel.'
    );
  }

  const existingId = await getState('dashboard_message_id');

  if (existingId) {
    try {
      return await dashboardChannel.messages.fetch(existingId);
    } catch {}
  }

  const placeholder = await dashboardChannel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📊 Project Dashboard')
        .setDescription('Preparing dashboard...'),
    ],
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

  await dashboardMessage.edit({
    embeds: [embed],
    components: [],
  });
}

module.exports = {
  updateDashboard,
};
