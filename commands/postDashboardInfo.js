const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {

data: new SlashCommandBuilder()
.setName('postdashboardinfo')
.setDescription('Post dashboard explanation'),

async execute(interaction){

const embed = new EmbedBuilder()

.setTitle("📊 Development Dashboard Guide")
.setColor(0x57f287)

.setDescription(
`The **Development Dashboard** tracks the progress of all departments and tasks in real time.

It automatically updates whenever tasks are created, started, assigned, or completed.`
)

.addFields(

{
name:"📌 Todo",
value:
`Tasks that have been created but not started yet.

These are waiting for a developer or team member to begin work.`,
inline:false
},

{
name:"⚙️ In Progress",
value:
`Tasks currently being worked on.

Developers mark tasks as **Start Task** when they begin.`,
inline:false
},

{
name:"✅ Completed",
value:
`Tasks that have been finished.

Completed tasks move to the archive and can still be viewed using:

/tasks archived`,
inline:false
},

{
name:"🏢 Department Tracking",
value:
`Each department has its own task counts:

• Frontend  
• Backend  
• Design  
• Marketing  

This helps management track workload and progress.`,
inline:false
},

{
name:"🏆 Top Contributors",
value:
`The dashboard also shows the most active contributors based on completed tasks.

This helps highlight productivity across the team.`,
inline:false
},

{
name:"🔄 Automatic Updates",
value:
`The dashboard updates automatically when:

• A task is created
• A task is assigned
• A task is started
• A task is completed

No manual updates are required.`,
inline:false
}

);

await interaction.channel.send({embeds:[embed]});

await interaction.reply({
content:"Dashboard guide posted.",
ephemeral:true
});

}
};
