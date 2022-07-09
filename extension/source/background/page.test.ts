import {isPage, Page} from './page';

describe('isPage', () => {
  describe('Given a page with an id and title', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(
          isPage({id: 'the id', title: 'the title', url: 'the url'} as Page)
        ).toBe(true);
      });
    });
  });
  describe('Given a page with an invalid title', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({id: 'the id', url: 'the url'} as Page)).toBe(false);
        expect(isPage({id: 'the id', title: '', url: 'the url'} as Page)).toBe(
          false
        );
        expect(isPage({id: 'the id', title: 123, url: 'the url'})).toBe(false);
        expect(
          isPage({id: 'the id', title: {prop: 'value'}, url: 'the url'})
        ).toBe(false);
      });
    });
  });
  describe('Given a page with an invalid id', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({title: 'the title', url: 'the url'} as Page)).toBe(
          false
        );
        expect(
          isPage({title: 'the title', id: '', url: 'the url'} as Page)
        ).toBe(false);
        expect(isPage({title: 'the title', id: 123, url: 'the url'})).toBe(
          false
        );
        expect(
          isPage({title: 'the title', id: {prop: 'value'}, url: 'the url'})
        ).toBe(false);
      });
    });
  });
  describe('Given a page with an invalid url', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({id: 'the id', title: 'the title'} as Page)).toBe(false);
        expect(
          isPage({id: 'the id', title: 'the title', url: ''} as Page)
        ).toBe(false);
        expect(isPage({id: 'the id', title: 'the title', url: 123})).toBe(
          false
        );
        expect(
          isPage({id: 'the id', title: 'the title', url: {prop: 'value'}})
        ).toBe(false);
      });
    });
  });
  describe("Given an argument that's not a page", () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({prop: 'value'})).toBe(false);
        expect(isPage({})).toBe(false);
        expect(isPage('value')).toBe(false);
        expect(isPage(123)).toBe(false);
        expect(isPage(null)).toBe(false);
        expect(isPage(undefined)).toBe(false);
        expect(
          isPage([{title: 'the title', id: 'the id', url: 'the url'} as Page])
        ).toBe(false);
      });
    });
  });
});
