const axios = require('axios');

const BASE = 'https://api.trello.com/1';

async function getBoardLists() {
  const res = await axios.get(`${BASE}/boards/${process.env.TRELLO_BOARD_ID}/lists`, {
    params: {
      key: process.env.TRELLO_KEY,
      token: process.env.TRELLO_TOKEN,
      cards: 'all',
      card_fields: 'name'
    }
  });

  return res.data;
}

module.exports = { getBoardLists };
