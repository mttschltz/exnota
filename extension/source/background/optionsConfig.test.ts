import {assertResultOk} from '@lib/testing';
import {isOptionsConfig, newOptionsConfig} from './optionsConfig';
import {isPage, newPage, Page} from './page';

// jest.mock('./page');

jest.mock('./page', () => {
  const original = jest.requireActual('./page');
  return {
    ...original,
    isPage: jest.fn(),
  };
});

describe('isOptionsConfig', () => {
  let isPageMock: jest.MockedFunction<typeof isPage>;
  beforeEach(() => {
    isPageMock = isPage as jest.MockedFunction<typeof isPage>;
  });

  describe('Given an options config with a valid page', () => {
    beforeEach(() => {
      isPageMock.mockReturnValueOnce(true);
      isPageMock.mockReturnValueOnce(true);
    });
    afterEach(() => {
      isPageMock.mockReset();
    });
    describe('When called', () => {
      test('Then it returns true', () => {
        const pageResult = newPage('id', 'title', 'url');
        assertResultOk(pageResult);
        expect(isOptionsConfig(newOptionsConfig(pageResult.value))).toBe(true);
        expect(
          isOptionsConfig({page: {id: 'the id', title: 'the title'} as Page})
        ).toBe(true);
      });
    });
  });
  describe('Given an options config with an invalid page', () => {
    beforeEach(() => {
      isPageMock.mockReturnValueOnce(false);
    });
    afterEach(() => {
      isPageMock.mockReset();
    });
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(
          isOptionsConfig({
            page: {id: 'the id', title: 'the title', url: 'the url'} as Page,
          })
        ).toBe(false);
      });
    });
  });
  describe("Given an argument that's not an object", () => {
    beforeEach(() => {
      isPageMock.mockReturnValue(true);
    });
    afterEach(() => {
      isPageMock.mockReset();
    });
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isOptionsConfig(null)).toBe(false);
        expect(isOptionsConfig(undefined)).toBe(false);
        expect(isOptionsConfig('value')).toBe(false);
      });
    });
  });
});
