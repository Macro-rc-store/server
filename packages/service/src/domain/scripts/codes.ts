export const WORKER = {
  LOGGER: 'worker-logger',
  AXIOS: 'worker-axios-classes',
  OTPAUTH: 'worker-otpauth'
}

export const SERVER_CLASS = {
  UTILS: {
    COMMON: 'server-classes-utils-common'
  },
  CHROME: {
    MAIN: 'server-classes-chrome',
    TAB: {
      HEADLESS: 'server-classes-chrome-tab-headless'
    },
    BROWSING_DATA: 'server-classes-chrome-browsing-data',
    REST_REQUEST: 'server-classes-chrome-rest-request',
    COOKIE: 'server-classes-chrome-cookie',
    WINDOW: 'server-classes-chrome-window'
  },
  PROXY: {
    LUNAPROXY: 'server-classes-proxy-lunaproxy'
  },
  FACEBOOK: {
    MAIN: 'server-classes-facebook-main',
    ENCRYPTION: 'server-classes-facebook-encryption'
  }
}

export const SERVER_EXECUTOR = {
  UTILS: {
    DELAY: 'server-executors-utils-delay'
  },
  CHROME: {
    RELOAD_WORKER: 'server-executors-chrome-reload-worker',
    CLEAR_BROWSINGDATA: 'server-executors-chrome-clear-browsingdata',
    WINDOW_OPEN: 'server-executors-chrome-window-open',
    WINDOW_CLOSE: 'server-executors-chrome-window-close'
  },
  PROXY: {
    LUNAPROXY_APPLY: 'server-executors-proxy-lunaproxy-apply',
    LUNAPROXY_CLEAR: 'server-executors-proxy-lunaproxy-clear'
  },
  FACEBOOK: {
    LOGIN_REST: 'server-executors-facebook-login-rest',
    SAVE_COOKIE: 'server-executors-facebook-save-cookie',
    ADD_EMAIL_API_V1: 'server-executors-facebook-add-email-api-v1',
    DELETE_EMAIL_API_V1: 'server-executors-facebook-delete-email-api-v1',
    DELETE_PHONE_API_V1: 'server-executors-facebook-delete-phone-api-v1',
    CHANGE_PASSWORD_API_V1: 'server-executors-facebook-change-password-api-v1',
    LOGOUT_DEVICE: 'server-executors-facebook-logout-device',
    CHECK_EXIST_EMAIL_PHONE: 'server-executors-facebook-check-exist-email-n-phone',
    CLEAR_NOTIFICATION: 'server-executors-facebook-clear-notification',
  },
}
