const axios = require('axios');

const BASE = 'https://api.trello.com/1';

async function getBoardLists() {
  const key = process.env.TRELLO_KEY;
  const token = process.env.TRELLO_TOKEN;
  const boardId = process.env.TRELLO_BOARD_ID;

  const listsRes = await axios.get(`${BASE}/boards/${boardId}/lists`, {
    params: { key, token }
  });

  const lists = listsRes.data;

  const cardsRes = await axios.get(`${BASE}/boards/${boardId}/cards`, {
    params: {
      key,
      token,
      fields: 'name,idList',
    }
  });

  const cards = cardsRes.data;

  for (const list of lists) {
    list.cards = cards.filter(card => card.idList === list.id);
  }

  return lists;
}

module.exports = { getBoardLists };
