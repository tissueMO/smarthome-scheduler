const express = require('express');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const { JobScheduler } = require('./schedule');

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.tz.setDefault('Asia/Tokyo');

const scheduler = new JobScheduler();
scheduler.start();

const timeFormat = 'YYYY-MM-DDTHH:mm';

express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .get('/schedules', (_, res) => {
    res.json(scheduler.schedules);
  })
  .put('/schedules', async (req, res) => {
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
  .post('/schedules/reservations', async (req, res) => {
    // Slack からのリクエストのみ受理
    if (!req.headers['user-agent'].includes('Slackbot')) {
      res.sendStatus(403);
      return;
    }

    // リクエストバリデーション
    const [ rawStart = '', rawEnd = '', type = 'silent', target = '*' ] = req.body.text
      .split(' ')
      .filter(t => t.length !== 0);
    const start = new Date(rawStart);
    const end = new Date(rawEnd);
    if (
      Number.isNaN(start.valueOf()) ||
      Number.isNaN(end.valueOf())
    ) {
      res.sendStatus(400);
      return;
    }

    // 予約追加
    let reservationName = '';
    const formatStart = dayjs.tz(start).format(timeFormat);
    const formatEnd = dayjs.tz(end).format(timeFormat);
    if (type === 'silent') {
      reservationName = 'サイレント予約';
      const schedule = scheduler.schedules;
      schedule.reservations.push({
        start: formatStart,
        end: formatEnd,
        target,
      });
    }

    // Slack API (Slash Commands) 準拠のレスポンス
    const { user_id: userId, response_url: responseUrl } = req.body;
    await axios.post(responseUrl, {
      response_type: 'in_channel',
      text: `<@${userId}> さんが ${reservationName} [${target}] (${formatStart}...${formatEnd}) を追加しました。`
    });

    res.sendStatus(200);
  })
  .listen(3000, '0.0.0.0', () => console.info('Expressサーバーでリクエストを待ち受けます...'));
