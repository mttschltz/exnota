import { ERROR_NOTION } from "@api/service"
import { UnknownHTTPResponseError, APIResponseError, APIErrorCode, ClientErrorCode, Client } from "@notionhq/client"
import { isHTTPResponseError } from "@notionhq/client/build/src/errors"

type APIResponse<T> = APISuccess<T> | APIError | UnknownError
interface APISuccess<T> {
  status: 'success'
  result: T
}
interface APIError {
  status: 'api-error'
  category: typeof ERROR_NOTION[keyof typeof ERROR_NOTION]
  error: UnknownHTTPResponseError | APIResponseError
} 
interface UnknownError {
  status: 'unknown-error'
  error: unknown
}
const api = async <APICall extends (...args: any) => Promise<any>, Args extends Parameters<APICall>[0], Return extends Awaited<ReturnType<APICall>>>(apiCall: APICall, client: Client, args: Args): Promise<APIResponse<Return>> => {
  let response: Return
  try {
    response = await apiCall.call(client, args)
  } catch(e) {
    if (isHTTPResponseError(e)) {
      let apiErrorCategory: APIError['category']
      switch (e.code) {
        case APIErrorCode.RateLimited:
          apiErrorCategory = 'api--notion--rate-limit'
          break;
        case APIErrorCode.Unauthorized:
          apiErrorCategory = 'api--notion--invalid-token'
          break
        case APIErrorCode.InternalServerError:
        case APIErrorCode.ServiceUnavailable:
          apiErrorCategory = 'api--notion--server-other'
          break;
        case APIErrorCode.ConflictError:
        case APIErrorCode.InvalidJSON:
        case APIErrorCode.InvalidRequest:
        case APIErrorCode.InvalidRequestURL:
        case APIErrorCode.ObjectNotFound:
        case APIErrorCode.RestrictedResource:
        case APIErrorCode.ValidationError:
          apiErrorCategory = 'api--notion--client-other'
          break;
        case ClientErrorCode.ResponseError:
          apiErrorCategory = 'api--notion--notionhq-other'
          break;
      }
      return {
        status: 'api-error',
        category: apiErrorCategory,
        error: e,
      }
    } else {
      return {
        status: 'unknown-error',
        error: e,
      }
    }
  }
  
  return {
    status: 'success',
    result: response,
  }
}

export { api }