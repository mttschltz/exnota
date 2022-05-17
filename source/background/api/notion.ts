import {APIErrorCode, Client, isNotionClientError} from '@notionhq/client';
import {createLog, unknownError} from '../../util/log';

type ApiStatus =
  | 'success'
  | 'notion-invalid-token'
  | 'notion-rate-limit-error'
  | 'notion-request-error' // an error likely inside our control
  | 'notion-other-error' // an error likely outside our control
  | 'unknown-error';

interface ApiResponse {
  result: ApiStatus;
}

// TODO: Do we need to pass the token here (or through messaging) or can we pull from options?
const validateToken = async (token: string): Promise<ApiResponse> => {
  const log = createLog('background', 'NotionAPIValidateToken');
  const notion = new Client({
    auth: token,
  });
  try {
    log.info('Testing token: Start');
    await notion.users.me({});
    log.info('Testing token: Finish');

    return {
      result: 'success',
    };
  } catch (e) {
    if (isNotionClientError(e)) {
      switch (e.code) {
        case APIErrorCode.Unauthorized:
          log.info('Testing token: Error (Notion invalid token)', {
            code: e.code,
            messsage: e.message,
            name: e.name,
          });
          return {
            result: 'notion-invalid-token',
          };
        // 429	"rate_limited"	This request exceeds the number of requests allowed. Slow down and try again. More details on rate limits
        case APIErrorCode.RateLimited:
          log.info('Testing token: Error (Notion rate limit error)', {
            code: e.code,
            messsage: e.message,
            name: e.name,
          });
          return {
            result: 'notion-rate-limit-error',
          };
        /* eslint-disable no-fallthrough */
        // 400	"invalid_json"	The request body could not be decoded as JSON.
        case APIErrorCode.InvalidJSON:
        // 400	"invalid_request_url"	The request URL is not valid.
        case APIErrorCode.InvalidRequestURL:
        // 400	"invalid_request"	This request is not supported.
        case APIErrorCode.InvalidRequest:
        // 400	"validation_error"	The request body does not match the schema for the expected parameters. Check the "message" property for more details.
        case APIErrorCode.ValidationError:
        // 400	"missing_version"	The request is missing the required Notion-Version header. See Versioning.
        // 403	"restricted_resource"	Given the bearer token used, the client doesn't have permission to perform this operation.
        case APIErrorCode.RestrictedResource:
        // 404	"object_not_found"	Given the bearer token used, the resource does not exist. This error can also indicate that the resource has not been shared with owner of the bearer token.
        case APIErrorCode.ObjectNotFound:
        // 409	"conflict_error"	The transaction could not be completed, potentially due to a data collision. Make sure the parameters are up to date and try again.
        case APIErrorCode.ConflictError:
          log.error('Testing token: Error (Notion request error)', {
            code: e.code,
            messsage: e.message,
            name: e.name,
          });
          return {
            result: 'notion-request-error',
          };
        /* eslint-enable no-fallthrough */
        default:
          log.error('Testing token: Error (Notion other error)', {
            code: e.code,
            messsage: e.message,
            name: e.name,
          });
          return {
            result: 'notion-other-error',
          };
      }
    } else {
      log.error('Testing token: Error (unknown error)', unknownError(e));
      return {
        result: 'unknown-error',
      };
    }
  }
};

export type {ApiStatus};
export {validateToken};
