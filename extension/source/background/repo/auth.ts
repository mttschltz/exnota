import {createLog, unknownError} from '@lib/log';
import {resultError, resultOk} from '@lib/result';
import {AuthConfigRepo} from '@background/repo';
import {AuthConfig, isAuthConfig, newAuthConfig} from '@background/authConfig';

const REPO_KEY = Object.freeze({
  AUTH_CONFIG: 'auth',
});

const AUTH_REPO_KEY = Object.freeze({
  CODE: 'code',
  TOKEN_RESPONSE: 'token_response',
});

const newAuthRepo = (storage: LocalForage): AuthConfigRepo => {
  const getConfig: AuthConfigRepo['getConfig'] = async () => {
    const log = createLog('background', 'GetConfigAuthRepo');
    try {
      log.info('Calling storage.getItem: Start');
      const authConfigRaw = await storage.getItem(REPO_KEY.AUTH_CONFIG);
      log.info('Calling storage.getItem: Finish');

      if (isAuthConfig(authConfigRaw)) {
        const authConfigResult = newAuthConfig(
          authConfigRaw.code,
          authConfigRaw.tokenResponse
        );
        return authConfigResult;
      }

      return resultOk(undefined);
    } catch (e) {
      log.error('Could not get auth config', unknownError(e));
      if (e instanceof Error) {
        return resultError('Could not get auth config', 'storage-get', e);
      }
      return resultError('Could not get auth config', 'storage-get');
    }
  };

  const saveConfig: AuthConfigRepo['saveConfig'] = async (
    authConfig: AuthConfig
  ) => {
    const log = createLog('background', 'SaveConfigAuthRepo');
    try {
      log.info('Calling storage.setItem: Start');
      await storage.setItem(REPO_KEY.AUTH_CONFIG, {
        [AUTH_REPO_KEY.CODE]: authConfig.code,
        // Notion recommends saving all data in the token response so you don't need to force
        // users to re-auth if you decide to use that information in the future.
        [AUTH_REPO_KEY.TOKEN_RESPONSE]: authConfig.tokenResponse,
      });
      log.info('Calling storage.setItem: Finish');

      return resultOk(undefined);
    } catch (e) {
      log.error('Could not set auth config', unknownError(e));
      if (e instanceof Error) {
        return resultError('Could not set auth config', 'storage-set', e);
      }
      return resultError('Could not set auth config', 'storage-set');
    }
  };

  return {
    getConfig,
    saveConfig,
  };
};

export {newAuthRepo};
