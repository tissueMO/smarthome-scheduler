const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { JobScheduler } = require('./schedule');
const actions = require('./action');

const scheduler = new JobScheduler();
scheduler.start();

const validateSlackBot = (req, res) => {
  if (!req.headers['user-agent'].includes('Slackbot')) {
    res.sendStatus(403);
  }
};

express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(cors())
  .get('/schedules', (_, res) => {
    res.json(scheduler.schedules);
  })
  .put('/schedules', async (req, res) => {
    try {
      scheduler.schedules = req.body;
    } catch (e) {
      res.status(400).json({ message: e.message });
      return;
    }

    await scheduler.save();
    await scheduler.start();

    res.json(scheduler.schedules);
  })
  .post('/actions/silent', async (req, res) => {
    validateSlackBot(req, res);

    try {
      const { user_id: userId, response_url: responseUrl, text } = req.body;
      await actions.reserveSilent({ userId, responseUrl, text, scheduler });
      res.status(200).end();
    } catch (e) {
      if (e instanceof TypeError) {
        res.status(400).end();
      }
    }
  })
  .post('/actions/spot', async (req, res) => {
    validateSlackBot(req, res);

    try {
      const { user_id: userId, response_url: responseUrl, text } = req.body;
      await actions.reserveSpot({ userId, responseUrl, text, scheduler });
      res.status(200).end();
    } catch (e) {
      if (e instanceof TypeError) {
        res.status(400).end();
      }
    }
  })
  .listen(3000, '0.0.0.0', () => console.info('Expressサーバーでリクエストを待ち受けます...'));
