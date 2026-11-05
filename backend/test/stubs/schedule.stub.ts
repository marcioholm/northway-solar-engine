// Os testes não executam os crons, e o pacote real é só ESM.
export const ScheduleModule = { forRoot: () => ({ module: class {} }) };
export const Cron = () => () => undefined;
export const CronExpression = { EVERY_5_MINUTES: '*/5 * * * *' };
