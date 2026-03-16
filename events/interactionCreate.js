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

        /* ---- /task assign ---- */

        if (
          interaction.commandName === 'task' &&
          interaction.options.getSubcommand() === 'assign'
        ) {

          const taskId = interaction.options.getInteger('task_id');
          const user = interaction.options.getUser('user');

          const task = await getTaskById(taskId);

          if (!task) {
            return interaction.reply({
              embeds: [
                buildInfoEmbed(
                  'Task not found',
                  'No task with that ID exists.',
                  0xed4245
                ),
              ],
              ephemeral: true,
            });
          }

          if (!canViewDepartment(interaction.member, task.department)) {
            return interaction.reply({
              embeds: [
                buildInfoEmbed(
                  'Access denied',
                  'You cannot modify this task.',
                  0xed4245
                ),
              ],
              ephemeral: true,
            });
          }

          const updatedTask = await updateTaskAssignee(taskId, user.id);

          /* Update the task message embed */

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
                components: [buildTaskButtons(updatedTask)]
              });
            }
          }

          await interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Task Updated',
                `Task **#${taskId}** is now assigned to ${user}.`,
                0x57f287
              ),
            ],
            ephemeral: true,
          });

          await updateDashboard(client);
          return;
        }

        /* ---- other slash commands ---- */

        const command = client.commands.get(interaction.commandName);

        if (command) {
          await command.execute(interaction, client);
        }

        return;
      }

      /* =========================
         MODAL SUBMIT (TASK CREATE)
      ========================= */

      if (
        interaction.isModalSubmit() &&
        interaction.customId === 'task_create_modal'
      ) {

        if (!canCreateTasks(interaction.member)) {
          return interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Access denied',
                'You do not have permission to create tasks.',
                0xed4245
              ),
            ],
            ephemeral: true,
          });
        }

        const title = interaction.fields.getTextInputValue('title').trim();
        const description = interaction.fields
          .getTextInputValue('description')
          .trim();

        /* ---- PRIORITY ---- */

        let priorityInput = '';

        try {
          priorityInput = interaction.fields
            .getTextInputValue('task_priority')
            .trim()
            .toLowerCase();
        } catch {
          priorityInput = '';
        }

        let priority = 'medium';

        if (priorityInput === 'high') priority = 'high';
        else if (priorityInput === 'low') priority = 'low';

        /* ---- DEADLINE ---- */

        let deadline = null;

        let deadlineInput = '';

        try {
          deadlineInput = interaction.fields
            .getTextInputValue('task_deadline')
            .trim();
        } catch {
          deadlineInput = '';
        }

        if (deadlineInput) {

          const parsed = new Date(deadlineInput);

          if (isNaN(parsed.getTime())) {
            return interaction.reply({
              embeds: [
                buildInfoEmbed(
                  'Invalid deadline',
                  'Deadline must be formatted as **YYYY-MM-DD**.',
                  0xed4245
                ),
              ],
              ephemeral: true,
            });
          }

          deadline = parsed;
        }

        /* ---- TARGET DEPARTMENT ---- */

        const department =
          interaction.fields.getStringSelectValues('department')[0];

        /* ---- SOURCE DEPARTMENT (WHO REQUESTED) ---- */

        const memberRoles = interaction.member.roles.cache;

        let sourceDepartment = 'unknown';

        if (memberRoles.some(r => r.name === 'Frontend')) sourceDepartment = 'frontend';
        else if (memberRoles.some(r => r.name === 'Backend')) sourceDepartment = 'backend';
        else if (memberRoles.some(r => r.name === 'Design')) sourceDepartment = 'design';
        else if (memberRoles.some(r => r.name === 'Marketing')) sourceDepartment = 'marketing';

        /* ---- CREATE TASK ---- */

        const task = await createTask({
          title,
          description,
          department,
          sourceDepartment,
          assignedUserId: null,
          priority,
          deadline,
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
          embeds: [
            buildInfoEmbed(
              'Task created',
              `Task **#${task.id} — ${task.title}** (${priority.toUpperCase()}) was created and sent to the **${department}** channel.`
            ),
          ],
          ephemeral: true,
        });
      }

      /* =========================
         BUTTON INTERACTIONS
      ========================= */

      if (interaction.isButton()) {

        const [action, taskIdRaw] = interaction.customId.split(':');
        const taskId = Number(taskIdRaw);

        if (
          !taskId ||
          !['task_start', 'task_complete', 'task_view'].includes(action)
        ) return;

        const task = await getTaskById(taskId);

        if (!task) {
          return interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Task not found',
                'This task no longer exists.',
                0xed4245
              ),
            ],
            ephemeral: true,
          });
        }

        if (!canViewDepartment(interaction.member, task.department)) {
          return interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Access denied',
                'You do not have access to this task.',
                0xed4245
              ),
            ],
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
      }

    } catch (error) {

      console.error('Interaction handling error:', error);

      const payload = {
        embeds: [
          buildInfoEmbed(
            'Error',
            'Something went wrong while processing that interaction.',
            0xed4245
          ),
        ],
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
