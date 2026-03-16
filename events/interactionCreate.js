const { Events } = require('discord.js');
const { createTask, getTaskById, updateTaskStatus } = require('../database/tasks');
const { updateDashboard } = require('../utils/dashboard');
const { getDepartmentChannelId } = require('../utils/channelRouter');
const { buildInfoEmbed, buildTaskDetailsEmbed, buildTaskEmbed } = require('../utils/embeds');
const { buildTaskButtons } = require('../utils/components');
const { canCreateTasks, canViewDepartment } = require('../utils/permissions');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
          await command.execute(interaction, client);
        }
        return;
      }

      if (interaction.isModalSubmit() && interaction.customId === 'task_create_modal') {
        if (!canCreateTasks(interaction.member)) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Access denied', 'You do not have permission to create tasks.', 0xed4245)],
            ephemeral: true,
          });
        }

        const title = interaction.fields.getTextInputValue('title').trim();
        const description = interaction.fields.getTextInputValue('description').trim();
        const department = interaction.fields.getStringSelectValues('department')[0];
        const assignedUser = interaction.fields.getSelectedUsers('assigned_user').first();

        if (!assignedUser) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Missing assignee', 'Please choose a user for the task.', 0xed4245)],
            ephemeral: true,
          });
        }

        const task = await createTask({
          title,
          description,
          department,
          assignedUserId: assignedUser.id,
        });

        const targetChannelId = getDepartmentChannelId(department);
        const targetChannel = await client.channels.fetch(targetChannelId);

        if (!targetChannel?.isTextBased()) {
          throw new Error(`Task channel for ${department} is not text-based.`);
        }

        await targetChannel.send({
          embeds: [buildTaskEmbed(task)],
          components: [buildTaskButtons(task)],
        });

        await updateDashboard(client);

        return interaction.reply({
          embeds: [buildInfoEmbed('Task created', `Task **#${task.id} — ${task.title}** was created and routed to the ${department} channel.`)],
          ephemeral: true,
        });
      }

      if (interaction.isButton()) {
        const [action, taskIdRaw] = interaction.customId.split(':');
        const taskId = Number(taskIdRaw);
        if (!taskId || !['task_start', 'task_complete', 'task_view'].includes(action)) return;

        const task = await getTaskById(taskId);
        if (!task) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Task not found', 'This task no longer exists.', 0xed4245)],
            ephemeral: true,
          });
        }

        if (!canViewDepartment(interaction.member, task.department)) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Access denied', 'You do not have access to this task.', 0xed4245)],
            ephemeral: true,
          });
        }

        if (action === 'task_view') {
          return interaction.reply({
            embeds: [buildTaskDetailsEmbed(task)],
            ephemeral: true,
          });
        }

        let updatedTask = task;
        if (action === 'task_start' && task.status === 'todo') {
          updatedTask = await updateTaskStatus(task.id, 'in_progress');
        }

        if (action === 'task_complete' && task.status !== 'completed') {
          updatedTask = await updateTaskStatus(task.id, 'completed');
        }

        await interaction.update({
          embeds: [buildTaskEmbed(updatedTask)],
          components: [buildTaskButtons(updatedTask)],
        });

        await updateDashboard(client);
        return;
      }
    } catch (error) {
      console.error('Interaction handling error:', error);

      const payload = {
        embeds: [buildInfoEmbed('Error', 'Something went wrong while processing that interaction.', 0xed4245)],
        ephemeral: true,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  },
};
