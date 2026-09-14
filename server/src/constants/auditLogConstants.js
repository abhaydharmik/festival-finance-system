const AUDIT_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  CANCEL: "cancel",
  ACTIVATE: "activate",
  DEACTIVATE: "deactivate",
  CLOSE: "close",
  SETTLE: "settle",
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_CHANGE: "password_change",
};

const AUDIT_MODULES = {
  AUTH: "auth",
  USER: "user",
  FESTIVAL: "festival",
  INCOME: "income",
  EXPENSE: "expense",
  CASH_DISTRIBUTION: "cash_distribution",
  DAILY_TALLY: "daily_tally",
};

module.exports = {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
};
