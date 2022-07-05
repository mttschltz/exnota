interface ResultOk<T> {
  readonly ok: true;
  readonly value: T;
}

class ResultOkImpl<T> implements ResultOk<T> {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  _value: T;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor(value: T) {
    this._value = value;
  }

  public get ok(): true {
    return true;
  }

  public get value(): T {
    return this._value;
  }
}

interface ResultError<E> {
  readonly ok: false;
  readonly errorType: E;
  readonly error: Error;
  readonly message: string;
  readonly metadata: ResultMetadata;
}

interface ResultMetadata {
  [key: string]:
    | (Date | ResultMetadata | boolean | number | string)[]
    | Date
    | ResultMetadata
    | boolean
    | number
    | string
    | undefined;
}

class ResultErrorImpl<E> implements ResultError<E> {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  _message: string;

  _error: Error;

  _errorType: E;

  _metadata: ResultMetadata;
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor(
    message: string,
    errorType: E,
    error?: Error,
    metadata: ResultMetadata = {}
  ) {
    this._message = message;
    this._errorType = errorType;
    this._error = error ?? new Error('Result error');
    this._metadata = metadata;
  }

  public get ok(): false {
    return false;
  }

  public get message(): string {
    return this._message;
  }

  public get errorType(): E {
    return this._errorType;
  }

  public get error(): Error {
    return this._error;
  }

  public get metadata(): ResultMetadata {
    return this._metadata;
  }
}

type Result<T, E> = ResultOk<T> | ResultError<E>;

function resultOk<T, E>(value: T): Result<T, E> {
  return new ResultOkImpl<T>(value);
}

function resultError<T, E extends string>(
  message: string,
  errorType: E,
  error?: Error,
  metadata?: ResultMetadata
): Result<T, E> {
  return new ResultErrorImpl<E>(message, errorType, error, metadata);
}

function isResult<T, E>(r: unknown): r is Result<T, E> {
  if (!r) {
    return false;
  }

  if (typeof (r as Result<T, E>).ok !== 'boolean') {
    return false;
  }

  if (isResultOk(r as Result<T, E>)) {
    return (r as ResultOk<T>).value !== undefined;
  }

  return (r as ResultError<E>).error !== undefined;
}

function isResultOk<T, E>(result: Result<T, E>): result is ResultOk<T> {
  return result.ok;
}

function isResultError<T, E>(result: Result<T, E>): result is ResultError<E> {
  return !result.ok;
}

interface Results<T, E> {
  readonly values: (T | undefined)[];
  readonly okValues: T[];
  readonly firstErrorResult: ResultError<E> | undefined;
  withOnlyFirstError: () => Results<T, E>;
}

class ResultsImpl<T, E> implements Results<T, E> {
  /* eslint-disable @typescript-eslint/explicit-member-accessibility */
  _results: Result<T, E>[];
  /* eslint-enable @typescript-eslint/explicit-member-accessibility */

  public constructor(rs: Result<T, E>[]) {
    this._results = rs;
  }

  public get firstErrorResult(): ResultError<E> | undefined {
    return this._results.find((r): r is ResultError<E> => !r.ok);
  }

  public get values(): (T | undefined)[] {
    return this._results.map((r) => (r.ok ? r.value : undefined));
  }

  public get okValues(): T[] {
    return this._results
      .filter((r): r is ResultOk<T> => r.ok)
      .map((r) => r.value);
  }

  public withOnlyFirstError(): Results<T, E> {
    const {firstErrorResult} = this;
    if (firstErrorResult) {
      return results([firstErrorResult]);
    }
    return results([]);
  }
}

function results<T, E>(rs: Result<T, E>[]): Results<T, E> {
  return new ResultsImpl(rs);
}

function resultsOk<T, E>(values: T[]): Results<T, E> {
  return new ResultsImpl(values.map((v) => resultOk(v)));
}

function resultsError<T, E extends string>(
  message: string,
  errorType: E,
  error?: Error,
  metadata?: ResultMetadata
): Results<T, E> {
  return new ResultsImpl([resultError(message, errorType, error, metadata)]);
}

function resultsErrorResult<T, E>(err: ResultError<E>): Results<T, E> {
  return new ResultsImpl([err]);
}

function serializeError(error: Error): Error {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
    cause: error.cause ? serializeError(error.cause) : undefined,
  };
}

function serializeResult<T, E>(r: Result<T, E>): Result<T, E> {
  if (isResultOk(r)) {
    return {
      ok: r.ok,
      value: r.value,
    };
  }
  return {
    ok: r.ok,
    error: serializeError(r.error),
    errorType: r.errorType,
    message: r.message,
    metadata: r.metadata,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type ReturnResultError<T extends (...args: any) => any> =
  ReturnType<T> extends Result<any, infer X> ? X : never;
type AsyncReturnResultError<T extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<T>
> extends Result<any, infer X>
  ? X
  : never;

/**
 * Get the error type of a function that returns a result, or a promise that returns a result. E.g.
 *
 * () => Promise<Result<any, ErrorType>>
 *
 * or
 *
 * () => Result<any, ErrorType>
 */
type FunctionResultError<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<any>
    ? AsyncReturnResultError<T>
    : ReturnResultError<T>;

type ReturnResultValue<T extends (...args: any) => any> =
  ReturnType<T> extends Result<infer X, any> ? X : never;
type AsyncReturnResultValue<T extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<T>
> extends Result<infer X, any>
  ? X
  : never;

/**
 * Get the value type of a function that returns a result, or a promise that returns a result. E.g.
 *
 * () => Promise<Result<ValueType, any>>
 *
 * or
 *
 * () => Result<ValueType, any>
 */
type FunctionResultValue<T extends (...args: any) => any> =
  ReturnType<T> extends Promise<any>
    ? AsyncReturnResultValue<T>
    : ReturnResultValue<T>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type {
  Result,
  ResultError,
  ResultOk,
  Results,
  ResultMetadata,
  FunctionResultError,
  FunctionResultValue,
};
export {
  resultOk,
  resultError,
  resultsError,
  resultsErrorResult,
  results,
  resultsOk,
  isResult,
  isResultOk,
  isResultError,
  serializeResult,
};
