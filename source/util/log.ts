type Data = Record<
  string,
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | Record<string, string | number | boolean>
  | Record<string, string | number | boolean>[]
>;

type Service = 'background' | 'options' | 'content';

const info =
  (service: Service,
    context: string) =>
  (message: string, data?: Data): void => {
    console.log(`[${service}] ${context}: ${message}`, data);
  };

const warn =
  (service: Service,
    context: string) =>
  (message: string, data?: Data): void => {
    console.warn(`[${service}] ${context}: ${message}`, data);
  };

const error =
  (service: Service,
    context: string) =>
  (message: string, data?: Data): void => {
    console.error(`[${service}] ${context}: ${message}`, data);
  };

const createLog = (
  service: Service,
  context: string
): {
  info: (message: string, data?: Data | undefined) => void;
  warn: (message: string, data?: Data | undefined) => void;
  error: (message: string, data?: Data | undefined) => void;
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
