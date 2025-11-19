import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BusinessException } from './business.exception';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any;

    if (exception instanceof BusinessException) {
      statusCode = exception.statusCode;
      errorResponse = {
        statusCode: exception.statusCode,
        message: exception.message,
        reason: exception.reason,
      };
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;
      errorResponse = {
        statusCode: statusCode,
        message: res.message || res.error || 'HttpException',
        reason: res.reason || 'HttpException',
      };
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: statusCode,
        message: exception.message,
        reason: exception.name,
      };
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        statusCode: statusCode,
        message: 'Unknown error',
        reason: 'UnhandledException',
      };
    }

    response.status(statusCode).json(errorResponse);
  }
}
