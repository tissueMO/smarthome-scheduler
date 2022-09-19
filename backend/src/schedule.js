const fs = require('fs').promises;
const axios = require('axios').default;
const { validate } = require('jsonschema');
const { CronJob } = require('cron');
const schema = require('./schedules.schema');
const holidayJp = require('@holiday-jp/holiday_jp');

class JobScheduler {
  /**
   * @property {Object}
   */
  #option;

  /**
   * @property {array[CronJob]}
   */
  #jobs = [];

  async load() {
    try {
      this.#option = JSON.parse(await fs.readFile(`${process.env.SCHEDULES_PATH}/schedules.json`));
    } catch (e) {
      console.warn('スケジュール設定が存在しないためデフォルト設定を使用します。', e);
      this.#option = {
        jobs: [],
        reservations: [],
      };
    }
    return this;
  }

  async save() {
    await fs.writeFile(`${process.env.SCHEDULES_PATH}/schedules.json`, JSON.stringify(this.#option));
    return this;
  }

  async start() {
    await this.load();

    this.#jobs.forEach((job) => job.stop());
    this.#jobs.splice();
    console.info('スケジュールをクリアしました。');

    const { jobs, reservations } = this.#option;

    const silentReservations = reservations
      .filter((reservation) => reservation.type === 'silent')
      .map(({ options }, i) => {
        console.info(`サイレント予約#${i + 1} [${options.target}] ${options.start}...${options.end}`);
        return options;
      })
      .map((options) => ({
        ...options,
        start: new Date(options.start),
        end: new Date(options.end),
      }));

    jobs
      .map((job, i) => {
        console.info(`ジョブ#${i + 1} [${job.title}] ${job.cronExpression}`);
        return job;
      })
      .map(({ cronExpression, url, title }, i) => {
        const hasHolidayCondition = cronExpression.match(/\$$/g) !== null;
        const hasNotHolidayCondition = cronExpression.match(/#$/g) !== null;
        cronExpression = '20 ' + cronExpression.replace('$', '*').replace('#', '*');

        return new CronJob(cronExpression, async () => {
          if (hasHolidayCondition && !this.#isHoliday()) {
            console.info(`ジョブ#${i + 1} [${title}] スキップ (土日祝制約)`);
            return;
          }
          if (hasNotHolidayCondition && this.#isHoliday()) {
            console.info(`ジョブ#${i + 1} [${title}] スキップ (平日制約)`);
            return;
          }
          if (this.#containsInSilentReservations(silentReservations, title)) {
            console.info(`ジョブ#${i + 1} [${title}] スキップ (サイレント予約)`);
            return;
          }

          console.info(`ジョブ#${i + 1} [${title}] トリガー`);
          try {
            await axios.post(url, {}, { headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            console.error(`POST失敗: ${e.response?.status}`);
          }
        });
      })
      .forEach((job) => {
        this.#jobs.push(job);
        job.start();
      });

    return this;
  }

  get schedules() {
    // 過去の予約を破棄
    const now = new Date();
    this.#option.reservations = this.#option.reservations.filter(
      (reservation) => now < new Date(reservation.options.end),
    );

    return this.#option;
  }

  set schedules(schedules) {
    const validation = validate(schedules, schema);
    if (validation.valid) {
      this.#option = schedules;
    } else {
      throw new Error(JSON.stringify(validation.errors));
    }
  }

  #containsInSilentReservations(reservations, title) {
    const now = new Date();
    return reservations.some(
      (reservation) =>
        reservation.start <= now &&
        now <= reservation.end &&
        (reservation.target === '*' || reservation.target === title),
    );
  }

  #isHoliday(date = null) {
    const d = date ?? new Date();
    return [0, 6].includes(d.getDay()) || holidayJp.isHoliday(d);
  }
}

exports.JobScheduler = JobScheduler;
