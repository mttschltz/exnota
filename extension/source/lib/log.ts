import {
  isResult,
  isResultOk,
  Result,
  ResultError,
  ResultMetadata,
} from './result';

type Service = 'background' | 'options' | 'content';

type Data = ResultMetadata;

const formatData = (
  data?: Data | Result<unknown, unknown>
): Data | undefined => {
  if (!isResult(data)) {
    return data;
  }

  if (isResultOk(data)) {
    return undefined;
  }
  return {
    errorMessage: data.message,
    errorType: typeof data.errorType === 'string' ? data.errorType : '',
    errorMetadata: data.metadata,
    error: data.error
      ? {
          message: data.error.message,
          name: data.error.name,
          stack: data.error.stack,
        }
      : undefined,
  };
};

const info =
  (service: Service, context: string) =>
  (message: string, data?: Data | Result<unknown, unknown>): void => {
    console.log(`[${service}] ${context}: ${message}`, formatData(data));
  };

const warn =
  (service: Service, context: string) =>
  (message: string, data?: Data | Result<unknown, unknown>): void => {
    console.warn(`[${service}] ${context}: ${message}`, formatData(data));
  };

const error =
  (service: Service, context: string) =>
  (message: string, data?: Data | Result<unknown, unknown>): void => {
    console.error(`[${service}] ${context}: ${message}`, formatData(data));
  };

const createLog = (
  service: Service,
  context: string
): {
  info: (
    message: string,
    data?: Data | Result<unknown, unknown> | undefined
  ) => void;
  warn: (
    message: string,
    data?: Data | Result<unknown, unknown> | undefined
  ) => void;
  error: (
    message: string,
    data?: Data | ResultError<unknown> | undefined
  ) => void;
} => {
  return {
    info: info(service, context),
    warn: warn(service, context),
    error: error(service, context),
  };
};

const isErrorish = (e: unknown): e is {name: string; message: string} => {
  return (e as Error).message !== undefined && (e as Error).name !== undefined;
};

const unknownError = (
  e: unknown
): {name: string; message: string} | undefined => {
  return isErrorish(e)
    ? {
        message: e.message,
        name: e.name,
      }
    : undefined;
};

export {createLog, isErrorish, unknownError};
