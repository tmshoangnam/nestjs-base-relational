export enum MessagesEnum {
  // Generic messages with resource parameter
  DATA_NOT_FOUND = 'errors.dataNotFound',
  DATA_EXISTS = 'errors.dataExists',
  DATA_NOT_EXISTS = 'errors.dataNotExists',

  // Legacy/specific messages
  NOT_FOUND = 'errors.notFound',
  EMAIL_OR_PASSWORD_INCORRECT = 'errors.emailOrPasswordIncorrect',
  USER_NOT_FOUND = 'errors.userNotFound',
  EMAIL_ALREADY_EXISTS = 'errors.emailAlreadyExists',
  EMAIL_EXISTS = 'errors.emailExists',
  EMAIL_NOT_EXISTS = 'errors.emailNotExists',
  INCORRECT_PASSWORD = 'errors.incorrectPassword',
  INCORRECT_OLD_PASSWORD = 'errors.incorrectOldPassword',
  MISSING_OLD_PASSWORD = 'errors.missingOldPassword',
  INVALID_HASH = 'errors.invalidHash',
  STATUS_NOT_EXISTS = 'errors.statusNotExists',
  ROLE_NOT_EXISTS = 'errors.roleNotExists',
  AUTH_UNAUTHORIZED = 'errors.unauthorized',
  INVALID_TOKEN = 'errors.invalidToken',
  AUTH_FORBIDDEN = 'errors.forbidden',
  LOGIN_VIA_PROVIDER = 'errors.loginViaProvider',
}
