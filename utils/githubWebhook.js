const express = require('express');
const crypto = require('crypto');
const { EmbedBuilder } = require('discord.js');

function verifyGitHubSignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.rawBody);
  const digest = `sha256=${hmac.digest('hex')}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

function buildPushEmbed(payload) {
  const commits = payload.commits.slice(0, 5);

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📦 Push — ${payload.repository.name}`)
    .setURL(payload.compare)
    .setDescription(
      commits.map(c =>
        `• **${c.message}**\nby \`${c.author.name}\``
      ).join('\n\n')
    )
    .addFields(
      { name: 'Branch', value: payload.ref.replace('refs/heads/', ''), inline: true },
      { name: 'Commits', value: String(payload.commits.length), inline: true }
    )
    .setTimestamp();
}

function buildPREmbed(payload) {
  const pr = payload.pull_request;

  return new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle(`🔀 PR — ${pr.title}`)
    .setURL(pr.html_url)
    .setDescription(pr.body || 'No description')
    .addFields(
      { name: 'Author', value: pr.user.login, inline: true },
      { name: 'Status', value: pr.state, inline: true }
    )
    .setTimestamp();
}

function startGitHubWebhookServer(client) {
  const app = express();

  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));

  app.post('/github', async (req, res) => {
    try {
      const secret = process.env.GITHUB_WEBHOOK_SECRET;

      if (!verifyGitHubSignature(req, secret)) {
        return res.status(401).send('Invalid signature');
      }

      const event = req.headers['x-github-event'];
      const payload = req.body;
      const repoName = payload.repository?.name?.toLowerCase();

// FRONTEND REPO
if (repoName === 'frontend') {

  if (event === 'push') {
    const ch = await client.channels.fetch(process.env.GITHUB_FRONTEND_PUSH_CHANNEL_ID);
    if (ch?.isTextBased()) {
      await ch.send({ embeds: [buildPushEmbed(payload)] });
    }
  }

  if (event === 'pull_request') {
    const ch = await client.channels.fetch(process.env.GITHUB_FRONTEND_PR_CHANNEL_ID);
    if (ch?.isTextBased()) {
      await ch.send({ embeds: [buildPREmbed(payload)] });
    }
  }
}

// BACKEND REPO
if (repoName === 'backend') {

  if (event === 'push') {
    const ch = await client.channels.fetch(process.env.GITHUB_BACKEND_PUSH_CHANNEL_ID);
    if (ch?.isTextBased()) {
      await ch.send({ embeds: [buildPushEmbed(payload)] });
    }
  }

  if (event === 'pull_request') {
    const ch = await client.channels.fetch(process.env.GITHUB_BACKEND_PR_CHANNEL_ID);
    if (ch?.isTextBased()) {
      await ch.send({ embeds: [buildPREmbed(payload)] });
    }
  }
}

      res.sendStatus(200);
    } catch (err) {
      console.error('GitHub webhook error:', err);
      res.sendStatus(500);
    }
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log('GitHub webhook running');
  });
}

module.exports = { startGitHubWebhookServer };
