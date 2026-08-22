import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

// HttpExceptionFilter keeps success and error responses predictable for every frontend client.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message = this.messageFrom(exceptionResponse, isHttpException ? exception.message : 'Internal server error.');

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }

  private messageFrom(exceptionResponse: string | object | null, fallback: string) {
    if (typeof exceptionResponse === 'string') return exceptionResponse;
    if (exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const message = (exceptionResponse as { message?: string | string[] }).message;
      return Array.isArray(message) ? message.join(', ') : message || fallback;
    }
    return fallback;
  }
}
