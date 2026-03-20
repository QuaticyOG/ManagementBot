const { Events } = require('discord.js');
const {
  createTask,
  getTaskById,
  updateTaskStatus,
  updateTaskAssignee,
} = require('../database/tasks');

const { updateDashboard } = require('../utils/dashboard');
const { getDepartmentChannelId } = require('../utils/channelRouter');
const {
  buildInfoEmbed,
  buildTaskDetailsEmbed,
  buildTaskEmbed,
} = require('../utils/embeds');

const { buildTaskButtons } = require('../utils/components');
const { canCreateTasks, canViewDepartment } = require('../utils/permissions');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {

      /* =========================
         SLASH COMMANDS
      ========================= */

      if (interaction.isChatInputCommand()) {

        if (
          interaction.commandName === 'task' &&
          interaction.options.getSubcommand() === 'assign'
        ) {

          const taskId = interaction.options.getInteger('task_id');
          const user = interaction.options.getUser('user');

          const task = await getTaskById(taskId);

          if (!task) {
            return interaction.reply({
              embeds: [buildInfoEmbed('Task not found', 'No task with that ID exists.', 0xed4245)],
              ephemeral: true,
            });
          }

          if (!canViewDepartment(interaction.member, task.department)) {
            return interaction.reply({
              embeds: [buildInfoEmbed('Access denied', 'You cannot modify this task.', 0xed4245)],
              ephemeral: true,
            });
          }

          const updatedTask = await updateTaskAssignee(taskId, user.id);

          // update message
          const channelId = getDepartmentChannelId(updatedTask.department);
          const channel = await client.channels.fetch(channelId);

          if (channel?.isTextBased()) {
            const messages = await channel.messages.fetch({ limit: 50 });

            const taskMessage = messages.find(m =>
              m.embeds.length &&
              m.embeds[0].footer?.text?.includes(`Task ID: ${taskId}`)
            );

            if (taskMessage) {
              await taskMessage.edit({
                embeds: [buildTaskEmbed(updatedTask)],
                components: [buildTaskButtons(updatedTask)],
              });
            }
          }

          await interaction.reply({
            embeds: [buildInfoEmbed('Task Updated', `Task **#${taskId}** is now assigned to ${user}.`, 0x57f287)],
            ephemeral: true,
          });

          await updateDashboard(client);
          return;
        }

        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction, client);

        return;
      }

      /* =========================
         MODAL SUBMIT
      ========================= */

      if (interaction.isModalSubmit() && interaction.customId === 'task_create_modal') {

        await interaction.deferReply({ flags: 64 });
        
        if (!canCreateTasks(interaction.member)) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Access denied', 'You do not have permission to create tasks.', 0xed4245)],
            ephemeral: true,
          });
        }

        const title = interaction.fields.getTextInputValue('title').trim();
        const description = interaction.fields.getTextInputValue('description').trim();

        let priorityInput = '';
        try {
          priorityInput = interaction.fields.getTextInputValue('task_priority').trim().toLowerCase();
        } catch {}

        let priority = 'medium';
        if (priorityInput === 'high') priority = 'high';
        else if (priorityInput === 'low') priority = 'low';

        const department = interaction.fields.getStringSelectValues('department')[0];

        // source department
        const roles = interaction.member.roles.cache;
        let sourceDepartment = 'unknown';

        if (
          roles.some(r =>
            ['Admin', 'Owner', 'Project Manager'].includes(r.name) ||
            r.name.toLowerCase().startsWith('head of')
          )
        ) {
          sourceDepartment = 'management';
        } else if (roles.some(r => r.name === 'Frontend')) {
          sourceDepartment = 'frontend';
        } else if (roles.some(r => r.name === 'Backend')) {
          sourceDepartment = 'backend';
        } else if (roles.some(r => r.name === 'Design')) {
          sourceDepartment = 'design';
        } else if (roles.some(r => r.name === 'Marketing')) {
          sourceDepartment = 'marketing';
        }

        const task = await createTask({
          title,
          description,
          department,
          sourceDepartment,
          assignedUserId: null,
          priority,
        });

        const channelId = getDepartmentChannelId(department);
        const channel = await client.channels.fetch(channelId);

        await channel.send({
          embeds: [buildTaskEmbed(task)],
          components: [buildTaskButtons(task)],
        });

        await updateDashboard(client);

        return interaction.editReply({
          embeds: [buildInfoEmbed('Task created', `Task **#${task.id} — ${task.title}** created.`)],
        });
      }

      /* =========================
         BUTTONS
      ========================= */

      if (interaction.isButton()) {

        const [action, taskIdRaw] = interaction.customId.split(':');
        const taskId = Number(taskIdRaw);

        if (!taskId || ![
          'task_start',
          'task_complete',
          'task_view',
          'task_assign_self'
        ].includes(action)) return;

        const task = await getTaskById(taskId);

        if (!task) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Task not found', 'This task no longer exists.', 0xed4245)],
            ephemeral: true,
          });
        }

        if (!canViewDepartment(interaction.member, task.department)) {
          return interaction.reply({
            embeds: [buildInfoEmbed('Access denied', 'You cannot access this task.', 0xed4245)],
            flags: 64,
          });
        }

        if (action === 'task_view') {
          return interaction.reply({
            embeds: [buildTaskDetailsEmbed(task)],
            ephemeral: true,
          });
        }

        // ✅ ASSIGN TO SELF
        if (action === 'task_assign_self') {

          if (task.assigned_user_id && task.assigned_user_id !== interaction.user.id) {
            return interaction.reply({
              embeds: [buildInfoEmbed('Already assigned', 'Task already taken.', 0xed4245)],
              ephemeral: true,
            });
          }

          const updatedTask = await updateTaskAssignee(task.id, interaction.user.id);

          await interaction.update({
            embeds: [buildTaskEmbed(updatedTask)],
            components: [buildTaskButtons(updatedTask)],
          });

          await updateDashboard(client);
          return;
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
      }

    } catch (error) {
      console.error('Interaction handling error:', error);

      const payload = {
        embeds: [buildInfoEmbed('Error', 'Something went wrong.', 0xed4245)],
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
