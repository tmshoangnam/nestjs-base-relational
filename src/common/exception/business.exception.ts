// src/common/exceptions/business.exception.ts

export class BusinessException extends Error {
  constructor(
    public readonly message: any,
    public readonly statusCode = 400,
    public readonly reason = 'BusinessException',
  ) {
    super(message);
  }

  // 🔹 HTTP-like helper methods
  static badRequest(message: any, reason = 'BadRequest') {
    return new BusinessException(message, 400, reason);
  }

  static unauthorized(message: any, reason = 'Unauthorized') {
    return new BusinessException(message, 401, reason);
  }

  static forbidden(message: any, reason = 'Forbidden') {
    return new BusinessException(message, 403, reason);
  }

  static notFound(message: any, reason = 'NotFound') {
    return new BusinessException(message, 404, reason);
  }

  static conflict(message: any, reason = 'Conflict') {
    return new BusinessException(message, 409, reason);
  }

  static unprocessable(message: any, reason = 'UnprocessableEntity') {
    return new BusinessException(message, 422, reason);
  }

  static internal(message: any, reason = 'InternalServerError') {
    return new BusinessException(message, 500, reason);
  }

  // 🔹 For unexpected situations or business rules
  static businessRule(message: any, reason = 'BusinessRuleViolation') {
    return new BusinessException(message, 400, reason);
  }

  // 🔹 For external system errors (e.g., database, API)
  static external(message: any, reason = 'ExternalSystemError') {
    return new BusinessException(message, 502, reason);
  }
}
