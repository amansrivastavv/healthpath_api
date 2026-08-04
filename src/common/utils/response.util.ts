export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: ErrorDetail[];
}

export class ApiResponseHelper {
  static success<T>(message: string, data: T = {} as T): SuccessResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errors: ErrorDetail[] = []): ErrorResponse {
    return {
      success: false,
      message,
      errors,
    };
  }
}
