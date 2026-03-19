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
    .setPlaceholder('Task title');

  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)
    .setPlaceholder('Describe the task');

  const priorityInput = new TextInputBuilder()
    .setCustomId('task_priority')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setPlaceholder('high / medium / low');

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
      }))
    );

  const assignedUserSelect = new UserSelectMenuBuilder()
    .setCustomId('assigned_user')
    .setPlaceholder('Select the assigned user')
    .setRequired(false)
    .setMinValues(0)
    .setMaxValues(1);

  return new ModalBuilder()
    .setCustomId('task_create_modal')
    .setTitle('Create Task')
    .addLabelComponents(

      new LabelBuilder()
        .setLabel('Title')
        .setDescription('Short task title')
        .setTextInputComponent(titleInput),

      new LabelBuilder()
        .setLabel('Description')
        .setDescription('What needs to be done')
        .setTextInputComponent(descriptionInput),

      new LabelBuilder()
        .setLabel('Priority')
        .setDescription('High / Medium / Low')
        .setTextInputComponent(priorityInput),

      new LabelBuilder()
        .setLabel('Department')
        .setDescription('Choose the task owner department')
        .setStringSelectMenuComponent(departmentSelect),

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
      .setCustomId(`task_assign_self:${task.id}`)
      .setLabel('Assign to Me')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`task_complete:${task.id}`)
      .setLabel('Complete Task')
      .setStyle(ButtonStyle.Success)
      .setDisabled(task.status === 'completed'),

    new ButtonBuilder()
      .setCustomId(`task_view:${task.id}`)
      .setLabel('View Details')
      .setStyle(ButtonStyle.Secondary)

  );

}

module.exports = {
  buildCreateTaskModal,
  buildTaskButtons,
};
