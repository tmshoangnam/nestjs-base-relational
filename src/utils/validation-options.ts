import {
  HttpStatus,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';
import { BusinessException } from '../common/exception/business.exception';

function generateErrors(errors: ValidationError[]) {
  return errors.flatMap((err) => formatValidationErrors(err));
}

function formatValidationErrors(
  error: ValidationError,
  parentPath: string[] = [],
) {
  const path = [...parentPath, error.property];

  const constraints = error.constraints
    ? Object.entries(error.constraints).map(([code, message]) => ({
        code, // vd: "isNotEmpty", "isEmail", ...
        path,
        message,
      }))
    : [];

  const children = error.children || [];

  const nested = children.flatMap((child) =>
    formatValidationErrors(child, path),
  );

  return [...constraints, ...nested];
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    throw BusinessException.unprocessable(
      'Validation failed',
      undefined,
      generateErrors(errors),
    );
  },
};

export default validationOptions;
