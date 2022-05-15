import type { Result, ResultError, ResultOk } from './result'

function assertResultError<T, E>(result: Result<T, E>): asserts result is ResultError<E> {
  if (result.ok) {
    throw new Error('Not a ResultError')
  }
}

function assertResultOk<T, E>(result: Result<T, E>): asserts result is ResultOk<T> {
  if (!result.ok) {
    throw new Error('Not a ResultOk')
  }
}

function mockThrows(msg: string): jest.Mock {
  return jest.fn().mockImplementation(() => {
    throw new Error(msg)
  })
}

export { assertResultError, assertResultOk, mockThrows }
