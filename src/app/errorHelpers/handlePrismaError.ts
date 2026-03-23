import { Prisma } from '@prisma/client';
import { TErrorSources } from '../interfaces/error.interfaces';

export const handlePrismaClientKnownRequestError = (err: Prisma.PrismaClientKnownRequestError) => {
  let errorSources: TErrorSources[] = [
    {
      path: '',
      message: err.message,
    },
  ];
  let message = "Database Error";
  let statusCode = 400;

  if (err.code === 'P2002') {
    const fields = err.meta?.target as string[];
    message = 'Duplicate Field Entry';
    errorSources = [
      {
        path: fields ? fields.join(', ') : '',
        message: `${fields ? fields.join(', ') : 'Field'} already exists`,
      },
    ];
    statusCode = 409;
  } else if (err.code === 'P2025') {
    message = 'Record Not Found';
    errorSources = [
      {
        path: '',
        message: err.meta?.cause as string || "Record not found",
      },
    ];
    statusCode = 404;
  }

  return { statusCode, message, errorSources };
};

export const handlePrismaClientUnknownError = (err: Prisma.PrismaClientUnknownRequestError) => {
  return {
    statusCode: 500,
    message: 'Unknown Database Error',
    errorSources: [
      {
        path: '',
        message: err.message,
      },
    ],
  };
};

export const handlePrismaClientValidationError = (err: Prisma.PrismaClientValidationError) => {
  return {
    statusCode: 400,
    message: 'Database Validation Error',
    errorSources: [
      {
        path: '',
        message: err.message,
      },
    ],
  };
};

export const handlePrismaClientRustPanicError = () => {
  return {
    statusCode: 500,
    message: 'Database connection failed',
    errorSources: [],
  };
};

export const handlePrismaClientInitializationError = (err: Prisma.PrismaClientInitializationError) => {
  return {
    statusCode: 500,
    message: 'Database Initialization Error',
    errorSources: [
      {
        path: '',
        message: err.message,
      },
    ],
  };
};
