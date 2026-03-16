const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { query } = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('board')
    .setDescription('View project task board'),

  async execute(interaction) {

    const result = await query(`SELECT * FROM tasks`);

    const todo = result.rows.filter(t => t.status === 'todo');
    const progress = result.rows.filter(t => t.status === 'in_progress');
    const done = result.rows.filter(t => t.status === 'completed');

    const embed = new EmbedBuilder()
      .setTitle('📋 Project Board')
      .addFields(
        {
          name: '🟢 Todo',
          value: todo.map(t => `#${t.id} ${t.title}`).join('\n') || 'None'
        },
        {
          name: '🟡 In Progress',
          value: progress.map(t => `#${t.id} ${t.title}`).join('\n') || 'None'
        },
        {
          name: '🔵 Completed',
          value: done.map(t => `#${t.id} ${t.title}`).join('\n') || 'None'
        }
      );

    await interaction.reply({ embeds: [embed] });

  }
};
