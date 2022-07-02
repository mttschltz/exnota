import { GET_NOTION_CLIENT_ID_URI_PART, GET_PAGES_URI_PART, GET_TOKEN_URI_PART } from "@api/service";

type Service = typeof GET_TOKEN_URI_PART | typeof  GET_PAGES_URI_PART | typeof  GET_NOTION_CLIENT_ID_URI_PART;

interface Metadata {
  [key: string]:
    | (Date | Metadata | boolean | number | string)[]
    | Date
    | Metadata
    | boolean
    | number
    | string
    | undefined;
}

const info =
  (service: Service, identifiers: Record<string, string | undefined>) =>
  (message: string, metadata?: Metadata): void => {
    console.log(`[${service}] ${message}`, { ...identifiers, ...metadata});
  };

const warn =
  (service: Service, identifiers: Record<string, string | undefined>) =>
  (message: string, metadata?: Metadata): void => {
    console.warn(`[${service}] ${message}`, { ...identifiers, ...metadata});
  };

const error =
  (service: Service, identifiers: Record<string, string | undefined>) =>
  (message: string, metadata?: Metadata): void => {
    console.error(`[${service}] ${message}`, { ...identifiers, ...metadata});
  };

const createLog = (
  service: Service, identifiers: Record<string, string | undefined>,
): {
  info: (
    message: string,
    metadata?: Metadata | undefined
  ) => void;
  warn: (
    message: string,
    metadata?: Metadata | undefined
  ) => void;
  error: (
    message: string,
    metadata?: Metadata | undefined
  ) => void;
} => {
  return {
    info: info(service, identifiers),
    warn: warn(service, identifiers),
    error: error(service, identifiers),
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
