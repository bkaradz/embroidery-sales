import { logger } from "$lib/utility/logger";
import cron from "node-cron";

cron.schedule('* * * * *', () => {
  logger.info('running a task every minute');
});

/**
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *

Allowed values

fields	        values
second	        0-59
minute	        0-59
hour	          0-23
day of month	  1-31
month	          1-12 (or names, e.g: Jan, Feb, March, April)
day of week	    0-7 (0 or 7 are sunday, or names, e.g. Sunday, Monday, Tue, Wed)

You may use multiples values separated by comma:
cron.schedule('1,2,4,5 * * * *', () => {
    logger.info('running every minute 1, 2, 4 and 5');
});

You may also define a range of values:
cron.schedule('1-5 * * * *', () => {
  logger.info('running every minute to 1 from 5');
});

Step values can be used in conjunction with ranges, following a range with '/' and a number.
 e.g: 1-10/2 that is the same as 2,4,6,8,10. Steps are also permitted after an asterisk, 
 so if you want to say “every two minutes”, just use /2.
 cron.schedule('/2 * * * *', () => {
  logger.info('running a task every two minutes');
});
*/