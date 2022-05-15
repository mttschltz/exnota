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

type Context = 'background' | 'options' | 'content';

const info =
  (context: Context) =>
  (message: string, data?: Data): void => {
    console.log(`${context}: ${message}`, data);
  };

const warn =
  (context: Context) =>
  (message: string, data?: Data): void => {
    console.warn(`${context}: ${message}`, data);
  };

const error =
  (context: Context) =>
  (message: string, data?: Data): void => {
    console.error(`${context}: ${message}`, data);
  };

const createLog = (
  context: Context
): {
  info: (message: string, data?: Data | undefined) => void;
  warn: (message: string, data?: Data | undefined) => void;
  error: (message: string, data?: Data | undefined) => void;
} => {
  return {
    info: info(context),
    warn: warn(context),
    error: error(context),
  };
};

export {createLog};