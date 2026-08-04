import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Array<{ field: string; message: string }> = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        const rawMessage = resObj.message;

        if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else if (Array.isArray(rawMessage)) {
          message = 'Validation failed';
        } else {
          message = exception.message || 'An error occurred';
        }

        // Extract validation errors array if it exists
        if (Array.isArray(resObj.errors)) {
          errors = (resObj.errors as unknown[]).map(
            (err): { field: string; message: string } => {
              const errObj = err as Record<string, unknown> | null | undefined;
              const field =
                errObj && typeof errObj.field === 'string'
                  ? errObj.field
                  : 'unknown';
              const messageVal =
                errObj && typeof errObj.message === 'string'
                  ? errObj.message
                  : 'Invalid value';
              return { field, message: messageVal };
            },
          );
        } else if (
          status === HttpStatus.BAD_REQUEST &&
          Array.isArray(resObj.message)
        ) {
          // Fallback parsing if message is an array of validation strings
          message = 'Validation failed';
          const msgs = resObj.message as unknown[];
          errors = msgs.map((msg) => {
            const msgStr = typeof msg === 'string' ? msg : 'Invalid value';
            const field = msgStr.split(' ')[0] || 'field';
            return { field, message: msgStr };
          });
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      message = exception.message;
    }

    const payload: Record<string, any> = {
      success: false,
      message: Array.isArray(message) ? 'Validation failed' : message,
    };

    if (errors.length > 0) {
      payload.errors = errors;
    }

    response.status(status).json(payload);
  }
}
