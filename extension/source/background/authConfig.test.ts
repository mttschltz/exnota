import {ExpectedTokenResponse, isAuthConfig} from './authConfig';

describe('isAuthConfig', () => {
  describe('Given an auth config with a valid code and no token response', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(isAuthConfig({code: 'code'})).toBe(true);
      });
    });
  });
  describe('Given an auth config with a valid token response and no config', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(isAuthConfig({tokenResponse: {access_token: 'token'}})).toBe(
          true
        );
        expect(
          isAuthConfig({
            tokenResponse: {
              access_token: 'token',
              bot_id: 'botid',
            } as ExpectedTokenResponse,
          })
        ).toBe(true);
      });
    });
  });
  describe('Given an auth config with a valid token response and valid config', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(isAuthConfig({tokenResponse: {access_token: 'token'}})).toBe(
          true
        );
      });
    });
  });
  describe('Given an auth config with a valid code and invalid token response', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(isAuthConfig({code: 'code', tokenResponse: 'invalid'})).toBe(
          false
        );
        expect(isAuthConfig({code: 'code', tokenResponse: 'invalid'})).toBe(
          false
        );
        expect(isAuthConfig({code: 'code', tokenResponse: {no: 'token'}})).toBe(
          false
        );
      });
    });
  });
  describe('Given an auth config with an invalid code and valid token response', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(
          isAuthConfig({code: {}, tokenResponse: {access_token: 'token'}})
        ).toBe(false);
        expect(
          isAuthConfig({code: 123, tokenResponse: {access_token: 'token'}})
        ).toBe(false);
      });
    });
  });
});
