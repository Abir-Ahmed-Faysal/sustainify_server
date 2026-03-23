import { ZodError } from 'zod';
import { TErrorSources } from '../interfaces/error.interfaces';

export const zodErrorData = (err: ZodError) => {
  const errorSources: TErrorSources[] = err.issues.map((issue) => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  return {
    statusCode: 400,
    message: 'Validation Error',
    errorSources,
  };
};
