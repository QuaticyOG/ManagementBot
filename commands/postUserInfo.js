const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('postuserinfo')
    .setDescription('Post user command guide'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📘 Task System — User Guide')

      .setDescription(
`Welcome! Here's how to use the task system.

You can view, take, and complete tasks assigned to your department.`
      )

      .addFields(

        {
          name: '📋 Viewing Tasks',
          value:
`• \`/tasks all\` — View all tasks you have access to  
• \`/tasks department\` — View tasks in your department  
• \`/tasks user\` — View your own tasks`,
        },

        {
          name: '🧠 Working on Tasks',
          value:
`• **Assign to Me** — Take a task  
• **Start Task** — Mark task as in progress  
• **Complete Task** — Mark task as done  
• **View Details** — See full task info`,
        },

        {
          name: '📦 Archived Tasks',
          value:
`• \`/tasks archived\` — View completed tasks  
• You can also open specific archived tasks`,
        },

        {
          name: '⚙️ Task Workflow',
          value:
`1️⃣ Task is created  
2️⃣ You click **Assign to Me**  
3️⃣ Click **Start Task**  
4️⃣ Click **Complete Task**`,
        },

        {
          name: '📊 Dashboard',
          value:
`The dashboard shows:
• Department progress  
• Tasks in each stage  
• Top contributors  

It updates automatically.`,
        }

      )

      .setFooter({ text: 'PackyGG Task System' });

await interaction.channel.send({
  embeds: [embed],
});

await interaction.reply({
  content: 'User info posted.',
  flags: 64
});
  },
};
