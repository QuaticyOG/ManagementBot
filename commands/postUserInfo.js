const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()
    .setName('postuserinfo')
    .setDescription('Post the user command guide'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("📘 Server Workspace Guide")
      .setColor(0x5865f2)

      .setDescription(
`This server uses a **task management system** to organize development work.

Tasks are created, assigned, and tracked through the bot.`
      )

      .addFields(

{
name:"📋 Viewing Tasks",
value:
`/tasks all
View all tasks you have permission to see.

 /tasks department
View tasks from a specific department.

 /tasks user
View tasks assigned to a specific user.`,
inline:false
},

{
name:"📦 Archived Tasks",
value:
`/tasks archived
View completed tasks.

 /tasks archived tasknumber
Open a specific archived task.`,
inline:false
},

{
name:"⚙️ Task Workflow",
value:
`1️⃣ Any team member can create a task using /task create  
2️⃣ Staff or department heads assign the task if needed  
3️⃣ The assigned developer clicks **Start Task**  
4️⃣ The task moves to **In Progress**  
5️⃣ When finished, the developer clicks **Complete Task**  
6️⃣ Completed tasks are stored in the archive`,
inline:false
},

{
name:"📊 Dashboard",
value:
`The dashboard shows:

• Todo tasks  
• In progress tasks  
• Completed tasks  
• Department productivity  
• Top contributors

Management uses this to track team progress.`,
inline:false
}

);

    await interaction.channel.send({embeds:[embed]});

    await interaction.reply({
      content:"User guide posted.",
      ephemeral:true
    });

  }
};
