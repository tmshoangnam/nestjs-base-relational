import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard response wrapper for all API endpoints.
 *
 * <p>This class provides a consistent response structure across all APIs,
 * ensuring clients receive predictable response formats with proper error handling.
 *
 */
export class ResponseData<T> {
  @ApiProperty({ description: 'Status code' })
  private statusCode: number; // HTTP status code

  @ApiProperty({ description: 'Message' })
  private message: string; // message

  @ApiProperty({ description: 'Data' })
  private data: T; // response data

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
