import {isOptionsConfig} from './optionsConfig';
import {isPage, Page} from './page';

jest.mock('./page');

describe('isOptionsConfig', () => {
  let isPageMock: jest.MockedFunction<typeof isPage>;
  beforeEach(() => {
    isPageMock = isPage as jest.MockedFunction<typeof isPage>;
  });

  describe('Given an options config with a valid page', () => {
    beforeEach(() => {
      isPageMock.mockReturnValueOnce(true);
    });
    afterEach(() => {
      isPageMock.mockReset();
    });
    describe('When called', () => {
      test('Then it returns true', () => {
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
      test('Then it returns true', () => {
        expect(
          isOptionsConfig({page: {id: 'the id', title: 'the title'} as Page})
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
