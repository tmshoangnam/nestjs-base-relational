// src/common/exceptions/business.exception.ts

export class BusinessException extends Error {
  constructor(
    public readonly message: any,
    public readonly statusCode = 400,
    public readonly reason = 'BusinessException',
    public readonly details?: any,
  ) {
    super(message);
  }

  // 🔹 HTTP-like helper methods
  static badRequest(message: any, reason = 'BadRequest', details?: any) {
    return new BusinessException(message, 400, reason, details);
  }

  static unauthorized(message: any, reason = 'Unauthorized', details?: any) {
    return new BusinessException(message, 401, reason, details);
  }

  static forbidden(message: any, reason = 'Forbidden', details?: any) {
    return new BusinessException(message, 403, reason, details);
  }

  static notFound(message: any, reason = 'NotFound', details?: any) {
    return new BusinessException(message, 404, reason, details);
  }

  static conflict(message: any, reason = 'Conflict', details?: any) {
    return new BusinessException(message, 409, reason, details);
  }

  static unprocessable(
    message: any,
    reason = 'UnprocessableEntity',
    details?: any,
  ) {
    return new BusinessException(message, 422, reason, details);
  }

  static internal(message: any, reason = 'InternalServerError', details?: any) {
    return new BusinessException(message, 500, reason, details);
  }

  // 🔹 For unexpected situations or business rules
  static businessRule(
    message: any,
    reason = 'BusinessRuleViolation',
    details?: any,
  ) {
    return new BusinessException(message, 400, reason, details);
  }

  // 🔹 For external system errors (e.g., database, API)
  static external(message: any, reason = 'ExternalSystemError', details?: any) {
    return new BusinessException(message, 502, reason, details);
  }
}
