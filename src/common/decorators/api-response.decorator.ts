import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export interface ApiSuccessResponseOptions {
  status?: number;
  description?: string;
  isArray?: boolean;
}

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiSuccessResponseOptions,
) => {
  const status = options?.status ?? 200;
  const description = options?.description ?? 'Successful response';
  const isArray = options?.isArray ?? false;

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
};

export const ApiErrorResponse = (
  status = 400,
  description = 'Error response',
) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email already exists' },
              },
            },
          },
        },
      },
    }),
  );
};
