const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

data: new SlashCommandBuilder()
.setName('poststaffinfo')
.setDescription('Post the staff command guide'),

async execute(interaction){

const embed = new EmbedBuilder()

.setTitle("🛠 Staff Task Management Guide")
.setColor(0xed4245)

.setDescription(
`Staff and department heads can manage development tasks using the commands below.

These tools allow you to create, assign, edit, and manage development work across departments.`
)

.addFields(

{
name:"📌 Creating Tasks",
value:
`/task create

Creates a new task for a department.

Includes:
• Title
• Description
• Department
• Priority
• Deadline`,
inline:false
},

{
name:"👤 Assigning Tasks",
value:
`/task assign tasknumber user

Assign a task to a developer.`,
inline:false
},

{
name:"✏️ Editing Tasks",
value:
`/taskedit tasknumber

Edit the title or description of a task.`,
inline:false
},

{
name:"📅 Task Deadlines",
value:
`/taskdeadline tasknumber YYYY-MM-DD

Set or update a task deadline.`,
inline:false
},

{
name:"⚡ Task Priority",
value:
`/taskpriority tasknumber

Change task priority.

🔴 High  
🟡 Medium  
🟢 Low`,
inline:false
},

{
name:"📦 Archived Tasks",
value:
`/tasks archived

View completed tasks.

 /tasks archived tasknumber

Open the full details of a completed task.`,
inline:false
},

{
name:"📊 Dashboard System",
value:
`The dashboard automatically tracks:

• Todo tasks
• In progress tasks
• Completed tasks
• Department productivity
• Top contributors

The dashboard updates whenever tasks are created, started, or completed.`,
inline:false
},

{
name:"🧹 System Commands",
value:
`/resettasks

Deletes all tasks and resets numbering.

 /resetdashboard

Rebuilds the dashboard message.`,
inline:false
}

);

await interaction.channel.send({embeds:[embed]});

await interaction.reply({
content:"Staff guide posted.",
ephemeral:true
});

}
};
