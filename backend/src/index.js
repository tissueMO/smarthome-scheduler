const express = require('express');
const bodyParser = require('body-parser');
const { JobScheduler } = require('./schedule');

const scheduler = new JobScheduler();
scheduler.start();

express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .get('/schedules', (_, res) => {
    res.json(scheduler.schedules);
  })
  .post('/schedules', async (req, res) => {
    try {
      scheduler.schedules = req.body;
    } catch (e) {
      res
        .status(400)
        .json({ message: e.message });
      return;
    }

    await scheduler.save();
    await scheduler.start();

    res.sendStatus(201);
  })
  .listen(3000, '0.0.0.0', () => console.info('Expressサーバーでリクエストを待ち受けます...'));
