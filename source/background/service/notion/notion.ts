import {APIErrorCode, Client, isNotionClientError} from '@notionhq/client';
import {createLog, isErrorish, unknownError} from '../../../lib/log';
import {Result, resultError, resultOk} from '../../../lib/result';
import {ValidateTokenApiError} from '../../usecase/setToken';

type ApiError = ValidateTokenApiError;

const validateToken = async (
  token: string
): Promise<Result<undefined, ApiError>> => {
  const log = createLog('background', 'NotionAPIValidateToken');
  const notion = new Client({
    auth: token,
  });
  try {
    log.info('Testing token: Start');
    await notion.users.me({});
    log.info('Testing token: Finish');

    return resultOk(undefined);
  } catch (e) {
    if (isNotionClientError(e)) {
      switch (e.code) {
        case APIErrorCode.Unauthorized:
          log.info('Testing token: Error (Notion invalid token)', {
            code: e.code,
            message: e.message,
            name: e.name,
          });
          return resultError(
            'Notion validation: Invalid token',
            'notion-invalid-token'
          );
        // 429	"rate_limited"	This request exceeds the number of requests allowed. Slow down and try again. More details on rate limits
        case APIErrorCode.RateLimited:
          log.info('Testing token: Error (Notion rate limit error)', {
            code: e.code,
            message: e.message,
            name: e.name,
          });
          return resultError(
            'Notion validation: Rate limit error',
            'notion-rate-limit-error'
          );
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
            message: e.message,
            name: e.name,
          });
          return resultError(
            `Notion validation: Request error; ${e.name}; ${e.message} (${e.code})`,
            'notion-request-error'
          );
        /* eslint-enable no-fallthrough */
        default:
          log.error('Testing token: Error (Notion other error)', {
            code: e.code,
            message: e.message,
            name: e.name,
          });
          return resultError(
            'Notion validation: Other error',
            'notion-other-error'
          );
      }
    } else {
      log.error('Testing token: Error (unknown error)', unknownError(e));
      if (isErrorish(e)) {
        return resultError(
          `Other validation error: ${e.name}; ${e.message}`,
          'unknown-error'
        );
      }
      return resultError(`Other validation error`, 'unknown-error');
    }
  }
};

export type {ApiError};
export {validateToken};
