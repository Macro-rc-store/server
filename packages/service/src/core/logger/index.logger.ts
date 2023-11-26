import logger from "../../../../../shared/logger/index.logger";
import config from '../../config/index.config';
import ENV from '../../config/env';

if (config.app.env == ENV.PRODUCTION) {
  logger.level = 'error';
}

export default logger;