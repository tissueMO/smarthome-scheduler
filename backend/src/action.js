const axios = require('axios').default;
const dayjs = require('dayjs');
const { JobScheduler } = require('./schedule');

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.tz.setDefault('Asia/Tokyo');

const timeFormat = 'YYYY-MM-DDTHH:mm';

/**
 * サイレント予約を追加します。
 * @param {Object} options
 * @param {string} options.userId
 * @param {string} options.responseUrl
 * @param {string} options.text
 * @param {JobScheduler} options.scheduler
 */
exports.reserveSilent = async ({ userId, responseUrl, text, scheduler }) => {
  // バリデーション
  const [rawStart = '', rawEnd = '', target = '*'] = text.split(' ').filter((t) => t.length !== 0);
  const [start, end] = [new Date(rawStart), new Date(rawEnd)];
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    throw new TypeError();
  }

  // 予約追加
  const formatStart = dayjs.tz(start).format(timeFormat);
  const formatEnd = dayjs.tz(end).format(timeFormat);
  scheduler.reserve('silent', {
    start: formatStart,
    end: formatEnd,
    target,
  });
  await scheduler.save();

  // Slack API (Slash Commands) 準拠のレスポンス
  await axios.post(responseUrl, {
    response_type: 'in_channel',
    text: `<@${userId}> さんが サイレント予約 [${target}] (${formatStart} ～ ${formatEnd}) を追加しました。`,
  });
};

/**
 * スポット予約を追加します。
 * @param {Object} options
 * @param {string} options.userId
 * @param {string} options.responseUrl
 * @param {string} options.text
 * @param {JobScheduler} options.scheduler
 */
exports.reserveSpot = async ({ userId, responseUrl, text, scheduler }) => {
  // バリデーション
  const [rawStart = '', target = '*'] = text.split(' ').filter((t) => t.length !== 0);
  const start = new Date(rawStart);
  if (Number.isNaN(start.valueOf())) {
    throw new TypeError();
  }

  // 予約追加
  const formatStart = dayjs.tz(start).format(timeFormat);
  const formatEnd = dayjs.tz(start).add(1, 'minute').format(timeFormat);
  scheduler.reserve('spot', {
    start: formatStart,
    end: formatEnd,
    target,
  });
  await scheduler.save();

  // Slack API (Slash Commands) 準拠のレスポンス
  await axios.post(responseUrl, {
    response_type: 'in_channel',
    text: `<@${userId}> さんが ${formatStart} にスポット予約 [${target}] を追加しました。`,
  });
};
