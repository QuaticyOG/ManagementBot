const { EmbedBuilder } = require('discord.js');
const { DEPARTMENTS, TASK_STATUSES } = require('../config/departments');

function formatTimestamp(value) {
  if (!value) return '—';
  return `<t:${Math.floor(new Date(value).getTime() / 1000)}:f>`;
}

function buildTaskEmbed(task) {
  const department = DEPARTMENTS[task.department];

  return new EmbedBuilder()
    .setColor(department.color)
    .setTitle(`Task #${task.id} — ${task.title}`)
    .addFields(
      { name: 'Department', value: department.label, inline: true },
      { name: 'Assigned To', value: `<@${task.assigned_user_id}>`, inline: true },
      { name: 'Status', value: TASK_STATUSES[task.status] ?? task.status, inline: true },
      { name: 'Description', value: task.description },
    )
    .setFooter({ text: `Task ID: ${task.id}` })
    .setTimestamp(new Date(task.created_at));
}

function buildTaskDetailsEmbed(task) {
  const department = DEPARTMENTS[task.department];

  return new EmbedBuilder()
    .setColor(department.color)
    .setTitle(`Task #${task.id} — ${task.title}`)
    .setDescription(task.description)
    .addFields(
      { name: 'Department', value: department.label, inline: true },
      { name: 'Assigned To', value: `<@${task.assigned_user_id}>`, inline: true },
      { name: 'Status', value: TASK_STATUSES[task.status] ?? task.status, inline: true },
      { name: 'Created At', value: formatTimestamp(task.created_at), inline: true },
      { name: 'Completed At', value: formatTimestamp(task.completed_at), inline: true },
    )
    .setFooter({ text: `Task ID: ${task.id}` });
}

function buildTaskListEmbed({ title, tasks, requestingUserId }) {
  const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle(title);

  if (!tasks.length) {
    return embed.setDescription('No matching tasks found.');
  }

  const lines = tasks.map((task) => {
    const department = DEPARTMENTS[task.department];
    const assignedMarker = task.assigned_user_id === requestingUserId ? ' • **You**' : '';
    return `**#${task.id} — ${task.title}**\n${department.label} • ${TASK_STATUSES[task.status]} • <@${task.assigned_user_id}>${assignedMarker}`;
  });

  return embed.setDescription(lines.join('\n\n'));
}

function buildInfoEmbed(title, description, color = 0x5865f2) {
  return new EmbedBuilder().setColor(color).setTitle(title).setDescription(description);
}

module.exports = {
  buildTaskEmbed,
  buildTaskDetailsEmbed,
  buildTaskListEmbed,
  buildInfoEmbed,
};
