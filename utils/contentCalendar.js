const { EmbedBuilder } = require('discord.js');
const { getBoardLists } = require('./trelloCalendar');
const { getState, setState } = require('../database/state');

function buildEmbed(lists) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📅 Content Calendar')
    .setTimestamp();

  for (const list of lists) {
    const cards = list.cards || [];

    embed.addFields({
      name: `📌 ${list.name}`,
      value: cards.length
        ? cards.map(c => `• ${c.name}`).join('\n')
        : 'No posts',
      inline: true
    });
  }

  return embed;
}

async function getOrCreateMessage(client) {
  const channel = await client.channels.fetch(process.env.CONTENT_CALENDAR_CHANNEL_ID);

  const existing = await getState('calendar_msg');

  if (existing) {
    try {
      return await channel.messages.fetch(existing);
    } catch {}
  }

  const msg = await channel.send({
    embeds: [new EmbedBuilder().setTitle('📅 Loading calendar...')]
  });

  await setState('calendar_msg', msg.id);
  return msg;
}

async function updateCalendar(client) {
  const lists = await getBoardLists();
  const embed = buildEmbed(lists);

  const msg = await getOrCreateMessage(client);

  await msg.edit({ embeds: [embed] });
}

module.exports = { updateCalendar };
