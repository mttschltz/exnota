import { isResult, ResultError, ResultMetadata } from "./result";

type Service = 'background' | 'options' | 'content';

type Data = ResultMetadata

const formatData = (data?: Data | ResultError<string>): Data | undefined => {
  if (isResult(data)) {
    return {
      errorMessage: data.message,
      errorType: data.errorType,
      errorMetadata: data.metadata,
    }
  }
  return data
}

const info =
  (service: Service,
    context: string) =>
  (message: string, data?: Data | ResultError<string>): void => {
    console.log(`[${service}] ${context}: ${message}`, formatData(data));
  };

const warn =
  (service: Service,
    context: string) =>
  (message: string, data?: Data | ResultError<string>): void => {
    console.warn(`[${service}] ${context}: ${message}`, formatData(data));
  };

const error =
  (service: Service,
    context: string) =>
  (message: string, data?: Data | ResultError<string>): void => {
    console.error(`[${service}] ${context}: ${message}`, formatData(data));
  };

const createLog = (
  service: Service,
  context: string
): {
  info: (message: string, data?: Data | ResultError<string> | undefined) => void;
  warn: (message: string, data?: Data | ResultError<string> | undefined) => void;
  error: (message: string, data?: Data | ResultError<string> | undefined) => void;
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

const unknownError = (e: unknown) => {
  return isErrorish(e) ? {
    messsage: e.message,
    name: e.name,
  } : undefined
}

export {createLog, unknownError};
