const { SlashCommandBuilder } = require('discord.js');

const {
  buildTaskListEmbed,
  buildTaskDetailsEmbed,
  buildInfoEmbed
} = require('../utils/embeds');

const {
  canViewDepartment,
  getAllowedDepartments,
  isManager
} = require('../utils/permissions');

const {
  listTasks,
  getTaskById
} = require('../database/tasks');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tasks')
    .setDescription('List tasks')

    .addSubcommand(subcommand =>
      subcommand
        .setName('all')
        .setDescription('List tasks visible to you')
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('department')
        .setDescription('List tasks for a department')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Department name')
            .setRequired(true)
            .addChoices(
              { name: 'Frontend', value: 'frontend' },
              { name: 'Backend', value: 'backend' },
              { name: 'Design', value: 'design' },
              { name: 'Marketing', value: 'marketing' }
            )
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('List tasks for a user')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User to inspect')
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('archived')
        .setDescription('List archived tasks')
        .addIntegerOption(option =>
          option
            .setName('tasknumber')
            .setDescription('View a specific archived task')
            .setRequired(false)
        )
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();
    const allowedDepartments = getAllowedDepartments(interaction.member);

    if (!allowedDepartments.length) {
      return interaction.reply({
        embeds: [
          buildInfoEmbed(
            'Access denied',
            'You do not have permission to view tasks.',
            0xed4245
          )
        ],
        ephemeral: true
      });
    }

    /* ========================
       /tasks all
    ======================== */

    if (subcommand === 'all') {

      const tasks = [];

      for (const department of allowedDepartments) {

        const departmentTasks = await listTasks({
          department,
          statuses: ['todo', 'in_progress', 'completed']
        });

        tasks.push(...departmentTasks);
      }

      const uniqueTasks = [
        ...new Map(tasks.map(task => [task.id, task])).values()
      ].slice(0, 50);

      return interaction.reply({
        embeds: [
          buildTaskListEmbed({
            title: 'Visible Tasks',
            tasks: uniqueTasks,
            requestingUserId: interaction.user.id
          })
        ],
        ephemeral: true
      });
    }

    /* ========================
       /tasks department
    ======================== */

    if (subcommand === 'department') {

      const department = interaction.options.getString('name', true);

      if (!canViewDepartment(interaction.member, department)) {
        return interaction.reply({
          embeds: [
            buildInfoEmbed(
              'Access denied',
              'You can only view tasks from your own department unless you are an Admin or Project Manager.',
              0xed4245
            )
          ],
          ephemeral: true
        });
      }

      const tasks = await listTasks({
        department,
        statuses: ['todo', 'in_progress', 'completed']
      });

      return interaction.reply({
        embeds: [
          buildTaskListEmbed({
            title: `Tasks • ${department}`,
            tasks,
            requestingUserId: interaction.user.id
          })
        ],
        ephemeral: true
      });
    }

    /* ========================
       /tasks user
    ======================== */

    if (subcommand === 'user') {

      const target = interaction.options.getUser('target', true);

      if (!isManager(interaction.member) && target.id !== interaction.user.id) {
        return interaction.reply({
          embeds: [
            buildInfoEmbed(
              'Access denied',
              'Department members can only view tasks assigned to themselves.',
              0xed4245
            )
          ],
          ephemeral: true
        });
      }

      const tasks = await listTasks({
        assignedUserId: target.id,
        statuses: ['todo', 'in_progress', 'completed']
      });

      const filtered = isManager(interaction.member)
        ? tasks
        : tasks.filter(task =>
            allowedDepartments.includes(task.department) &&
            task.assigned_user_id === interaction.user.id
          );

      return interaction.reply({
        embeds: [
          buildTaskListEmbed({
            title: `Tasks for ${target.tag}`,
            tasks: filtered,
            requestingUserId: interaction.user.id
          })
        ],
        ephemeral: true
      });
    }

    /* ========================
       /tasks archived
    ======================== */

    if (subcommand === 'archived') {

      const taskNumber = interaction.options.getInteger('tasknumber');

      /* VIEW SPECIFIC ARCHIVED TASK */

      if (taskNumber) {

        const task = await getTaskById(taskNumber);

        if (!task || task.status !== 'completed') {
          return interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Task not found',
                'That archived task does not exist.',
                0xed4245
              )
            ],
            ephemeral: true
          });
        }

        if (!canViewDepartment(interaction.member, task.department)) {
          return interaction.reply({
            embeds: [
              buildInfoEmbed(
                'Access denied',
                'You do not have access to that task.',
                0xed4245
              )
            ],
            ephemeral: true
          });
        }

        return interaction.reply({
          embeds: [buildTaskDetailsEmbed(task)],
          ephemeral: true
        });
      }

      /* SHOW ARCHIVED LIST */

      const archived = [];

      for (const department of allowedDepartments) {

        const departmentTasks = await listTasks({
          department,
          status: 'completed'
        });

        archived.push(...departmentTasks);
      }

      const uniqueTasks = [
        ...new Map(archived.map(task => [task.id, task])).values()
      ].slice(0, 50);

      return interaction.reply({
        embeds: [
          buildTaskListEmbed({
            title: 'Archived Tasks',
            tasks: uniqueTasks,
            requestingUserId: interaction.user.id
          })
        ],
        ephemeral: true
      });
    }

  }
};
