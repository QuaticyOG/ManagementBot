const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} = require('discord.js');
const { DEPARTMENTS } = require('../config/departments');

function buildCreateTaskModal() {
  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder('Fix Login UI');

  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)
    .setPlaceholder('Fix mobile layout issue on login page.');

  const departmentSelect = new StringSelectMenuBuilder()
    .setCustomId('department')
    .setPlaceholder('Select a department')
    .setRequired(true)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      ...Object.values(DEPARTMENTS).map((department) => ({
        label: department.label,
        value: department.key,
      })),
    );

  const assignedUserSelect = new UserSelectMenuBuilder()
    .setCustomId('assigned_user')
    .setPlaceholder('Select the assigned user')
    .setRequired(true)
    .setMinValues(1)
    .setMaxValues(1);

  return new ModalBuilder()
    .setCustomId('task_create_modal')
    .setTitle('Create Task')
    .addLabelComponents(
      new LabelBuilder().setLabel('Title').setDescription('Short task title').setTextInputComponent(titleInput),
      new LabelBuilder().setLabel('Description').setDescription('What needs to be done').setTextInputComponent(descriptionInput),
      new LabelBuilder().setLabel('Department').setDescription('Choose the task owner department').setStringSelectMenuComponent(departmentSelect),
      new LabelBuilder().setLabel('Assigned User').setDescription('Pick the assignee').setUserSelectMenuComponent(assignedUserSelect),
    );
}

function buildTaskButtons(task) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`task_start:${task.id}`)
      .setLabel('Start Task')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(task.status !== 'todo'),
    new ButtonBuilder()
      .setCustomId(`task_complete:${task.id}`)
      .setLabel('Complete Task')
      .setStyle(ButtonStyle.Success)
      .setDisabled(task.status === 'completed'),
    new ButtonBuilder()
      .setCustomId(`task_view:${task.id}`)
      .setLabel('View Details')
      .setStyle(ButtonStyle.Secondary),
  );
}

module.exports = {
  buildCreateTaskModal,
  buildTaskButtons,
};
