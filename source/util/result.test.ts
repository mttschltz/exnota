import {
  isResult,
    isResultError,
    isResultOk,
    Result,
    ResultError,
    resultError,
    ResultMetadata,
    ResultOk,
    resultOk,
    Results,
    results,
    resultsError,
    resultsErrorResult,
    resultsOk,
  } from './result'
  import { assertResultError, assertResultOk } from './testing' 
  
  interface OkType {
    cat: string
  }
  
  describe('Result', () => {
    describe('Given an ok Result', () => {
      let result: Result<OkType, 'error'>
      let value: OkType
      beforeEach(() => {
        value = { cat: 'dog' }
        result = resultOk(value)
      })
      describe('When resultOk is called', () => {
        test('Then it returns the expected values', () => {
          expect(result.ok).toBe(true)
          assertResultOk(result)
          expect(result.value).toBe(value)
        })
      })
    })
    describe('Given an error Result', () => {
      describe('When resultError is called', () => {
        describe('And only a message and type are provided', () => {
          let result: Result<string, 'error-type'>
          beforeEach(() => {
            result = resultError('an error message', 'error-type')
          })
          test('Then it returns the expected values', () => {
            expect(result.ok).toBe(false)
            assertResultError(result)
            expect(result).toMatchObject({
              message: 'an error message',
              errorType: 'error-type',
              error: new Error('Result error'),
              ok: false,
              metadata: {},
            })
          })
        })
        describe('And an Error is provided', () => {
          let result: Result<string, 'error-type'>
          let error: Error
          beforeEach(() => {
            error = new Error('an error')
            result = resultError('an error message', 'error-type', error)
          })
          test('Then it returns the expected values', () => {
            assertResultError(result)
            expect(result).toMatchObject({
              message: 'an error message',
              errorType: 'error-type',
              error: new Error('an error'),
              ok: false,
              metadata: {},
            })
          })
        })
        describe('And metadata is provided', () => {
          let result: Result<string, 'error-type'>
          let metadata: ResultMetadata
          beforeEach(() => {
            metadata = {
              string: 'a string',
              boolean: true,
              date: new Date('2022-01-02'),
              number: 1,
              nested: {
                string: 'nested string',
              },
            }
            result = resultError('an error message', 'error-type', undefined, metadata)
          })
          test('Then it returns the expected values', () => {
            assertResultError(result)
            expect(result).toMatchObject({
              message: 'an error message',
              errorType: 'error-type',
              error: new Error('Result error'),
              ok: false,
              metadata,
            })
          })
        })
      })
    })
    describe('resultsError', () => {
      describe('Given an error message', () => {
        describe('When only a message provided', () => {
          test('Then Results is returned with the expected single error', () => {
            const r = resultsError('error message', 'error')
            expect(r.firstErrorResult).toMatchObject({
              message: 'error message',
              error: new Error('Result error'),
              ok: false,
              metadata: {},
            })
            expect(r.okValues).toEqual([])
            expect(r.values).toEqual([undefined])
          })
        })
        describe('When an error object is provided', () => {
          test('Then Results is returned with the expected single error', () => {
            const error = new Error('error object')
            const r = resultsError('error message', 'error-type', error)
            expect(r.firstErrorResult).toMatchObject({
              message: 'error message',
              errorType: 'error-type',
              error: new Error('error object'),
              ok: false,
              metadata: {},
            })
            expect(r.firstErrorResult?.error).toBe(error)
            expect(r.okValues).toEqual([])
            expect(r.values).toEqual([undefined])
          })
        })
        describe('When metadata is provided', () => {
          test('Then Results is returned with the metadata', () => {
            const metadata: ResultMetadata = {
              string: 'a string',
              boolean: true,
              date: new Date('2022-01-02'),
              number: 1,
              nested: {
                string: 'nested string',
              },
            }
            const r = resultsError('error message', 'error', undefined, metadata)
            expect(r.firstErrorResult).toMatchObject({
              message: 'error message',
              error: new Error('Result error'),
              ok: false,
              metadata,
            })
            expect(r.firstErrorResult?.metadata).toBe(metadata)
            expect(r.okValues).toEqual([])
            expect(r.values).toEqual([undefined])
          })
        })
      })
    })
    describe('resultsErrorResult', () => {
      describe('Given an error result', () => {
        describe('When called', () => {
          test('Then Results is returned with the expected single error', () => {
            const err: ResultError<'error'> = {
              errorType: 'error',
              error: new Error('error object'),
              message: 'error message',
              ok: false as const,
              metadata: {
                string: 'a string',
                boolean: true,
                date: new Date('2022-01-02'),
                number: 1,
                nested: {
                  string: 'nested string',
                },
              },
            }
            const r = resultsErrorResult(err)
            expect(r.firstErrorResult).toBe(err)
            expect(r.okValues).toEqual([])
            expect(r.values).toEqual([undefined])
          })
        })
      })
    })
    describe('resultsOk', () => {
      describe('Given a list of values', () => {
        test('Then a Results instance is returned with no first error value', () => {
          const r = resultsOk(['one', 'two', 'three'])
          expect(r.firstErrorResult).toBeUndefined()
          expect(r.okValues).toEqual(['one', 'two', 'three'])
          expect(r.values).toEqual(['one', 'two', 'three'])
        })
      })
    })
    describe('results', () => {
      describe('Given a list of results', () => {
        let inputResults: Result<OkType, 'error'>[]
        let result1: ResultOk<OkType>
        let result2: ResultError<'error'>
        let result3: ResultOk<OkType>
        let result4: ResultError<'error'>
        beforeEach(() => {
          result1 = {
            ok: true,
            value: {
              cat: 'dog',
            },
          }
          result2 = {
            ok: false,
            message: 'an error message',
            errorType: 'error',
            error: new Error('an error'),
            metadata: {
              string: 'a string',
              boolean: true,
              date: new Date('2022-01-02'),
              number: 1,
              nested: {
                string: 'nested string',
              },
            },
          }
          result3 = {
            ok: true,
            value: {
              cat: 'donkey',
            },
          }
          result4 = {
            ok: false,
            message: 'an error message 2',
            errorType: 'error',
            error: new Error('an error 2'),
            metadata: {},
          }
          inputResults = [result1, result2, result3, result4]
        })
        describe('When results is called', () => {
          let rs: Results<OkType, 'error'>
          beforeEach(() => {
            rs = results(inputResults)
          })
          test('Then firstErrorResult returns the first error', () => {
            expect(rs.firstErrorResult).toBe(result2)
          })
          test('Then values returns 4 entries with undefined for ok Results', () => {
            expect(rs.values).toEqual([result1.value, undefined, result3.value, undefined])
          })
          test('Then okValues returns the 2 ok values', () => {
            expect(rs.okValues).toEqual([result1.value, result3.value])
          })
          test('Then withOnlyFirstError returns a new Results instance with only the first error', () => {
            const rs2 = rs.withOnlyFirstError()
            expect(rs2.firstErrorResult).toEqual(result2)
            expect(rs2.okValues).toEqual([])
            expect(rs2.values).toEqual([undefined])
          })
        })
      })
      describe('Given a list of results with no errors', () => {
        let inputResults: Result<OkType, 'error'>[]
        let result1: ResultOk<OkType>
        let result3: ResultOk<OkType>
        beforeEach(() => {
          result1 = {
            ok: true,
            value: {
              cat: 'dog',
            },
          }
          result3 = {
            ok: true,
            value: {
              cat: 'donkey',
            },
          }
          inputResults = [result1, result3]
        })
        describe('When results is called', () => {
          let rs: Results<OkType, 'error'>
          beforeEach(() => {
            rs = results(inputResults)
          })
          test('Then firstErrorResult returns undefined', () => {
            expect(rs.firstErrorResult).toBeUndefined()
          })
          test('Then values returns both entries', () => {
            expect(rs.values).toEqual([result1.value, result3.value])
          })
          test('Then okValues returns both ok values', () => {
            expect(rs.okValues).toEqual([result1.value, result3.value])
          })
          test('Then withOnlyFirstError returns a new Results instance with no entries', () => {
            const rs2 = rs.withOnlyFirstError()
            expect(rs2.firstErrorResult).toBeUndefined()
            expect(rs2.okValues).toEqual([])
            expect(rs2.values).toEqual([])
          })
        })
      })
    })
  })
  describe('isResult', () => {
    describe('Given an ok result', () => {
      test('Then it returns true', () => {
        const ok = resultOk('result')
        expect(isResult(ok)).toBe(true)
      })
    })
    describe('Given an error result', () => {
      test('Then it returns true', () => {
        const err = resultError<string, 'error'>('error', 'error')
        expect(isResult(err)).toBe(true)
      })
    })
    describe('Given a non-result object', () => {
      test('Then it returns false', () => {
        expect(isResult({})).toBe(false)
        expect(isResult({hey: "hello"})).toBe(false)
      })
    })
    describe('Given a primitive', () => {
      test('Then it returns false', () => {
        expect(isResult(undefined)).toBe(false)
        expect(isResult(null)).toBe(false)
        expect(isResult(1)).toBe(false)
        expect(isResult('hi')).toBe(false)
        expect(isResult(true)).toBe(false)
      })
    })
  })
  describe('isResultOk', () => {
    describe('Given an ok result', () => {
      test('Then it returns true', () => {
        const ok = resultOk('result')
        expect(isResultOk(ok)).toBe(true)
      })
    })
    describe('Given an error result', () => {
      test('Then it returns false', () => {
        const err = resultError<string, 'error'>('error', 'error')
        expect(isResultOk(err)).toBe(false)
      })
    })
  })
  describe('isResultError', () => {
    describe('Given an error result', () => {
      test('Then it returns true', () => {
        const err = resultError<string, 'error'>('error', 'error')
        expect(isResultError(err)).toBe(true)
      })
    })
    describe('Given an ok result', () => {
      test('Then it returns false', () => {
        const ok = resultOk('result')
        expect(isResultError(ok)).toBe(false)
      })
    })
  })
  