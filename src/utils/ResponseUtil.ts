import { HttpStatus } from '@nestjs/common';
import { ResponseData } from './dto/ResponseData';

/**
 * Utility class for creating standardized API responses.
 *
 * This class provides static methods to create consistent ResponseData responses
 * for all API endpoints in the NestJS application.
 */
export class ResponseUtil {
  /**
   * Standard success message.
   */
  private static readonly SUCCESS = 'Success';

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Creates a successful response with no data.
   *
   * @return ResponseData with statusCode 200 and success message
   */
  public static success<T>(data?: T): ResponseData<T | null> {
    return new ResponseData<T | null>(
      HttpStatus.OK,
      this.SUCCESS,
      data ?? null,
    );
  }

  /**
   * Creates a successful response with data.
   *
   * @param data The data to return
   * @return ResponseData with statusCode 200, success message, and data
   */
  public static successWithData<T>(data: T): ResponseData<T> {
    return new ResponseData<T>(HttpStatus.OK, this.SUCCESS, data);
  }

  /**
   * Creates an accepted response with data.
   *
   * @param data The data to return
   * @return ResponseData with statusCode 202, success message, and data
   */
  public static accepted<T>(data: T): ResponseData<T> {
    return new ResponseData<T>(
      HttpStatus.ACCEPTED,
      HttpStatus[HttpStatus.ACCEPTED],
      data,
    );
  }

  /**
   * Creates an error response with a message.
   *
   * @param message The error message
   * @return ResponseData with statusCode 400 and error message
   */
  public static error(message: string): ResponseData<null> {
    return new ResponseData<null>(HttpStatus.BAD_REQUEST, message, null);
  }

  /**
   * Creates an error response with data.
   *
   * @param data The error data
   * @return ResponseData with statusCode 400, fail message, and data
   */
  public static errorWithData<T>(data: T): ResponseData<T> {
    return new ResponseData<T>(HttpStatus.BAD_REQUEST, 'fail', data);
  }

  /**
   * Creates a custom response with status code and message.
   *
   * @param statusCode The HTTP status code
   * @param message The response message
   * @return ResponseData with custom status code and message
   */
  public static custom(
    statusCode: number,
    message: string,
  ): ResponseData<null> {
    return new ResponseData<null>(statusCode, message, null);
  }

  /**
   * Creates a custom response with status code, message, and data.
   *
   * @param statusCode The HTTP status code
   * @param message The response message
   * @param data The data to return
   * @return ResponseData with custom status code, message, and data
   */
  public static customWithData<T>(
    statusCode: number,
    message: string,
    data: T,
  ): ResponseData<T> {
    return new ResponseData<T>(statusCode, message, data);
  }
}
