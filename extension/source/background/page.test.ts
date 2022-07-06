import {isPage, Page} from './page';

describe('isPage', () => {
  describe('Given a page with an id and title', () => {
    describe('When called', () => {
      test('Then it returns true', () => {
        expect(isPage({id: 'the id', title: 'the title'} as Page)).toBe(true);
      });
    });
  });
  describe('Given a page with an id and no title', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({id: 'the id'} as Page)).toBe(false);
        expect(isPage({id: 'the id', title: ''} as Page)).toBe(false);
      });
    });
  });
  describe('Given a page with an id and invalid title', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({id: 'the id', title: 123})).toBe(false);
        expect(isPage({id: 'the id', title: {prop: 'value'}})).toBe(false);
      });
    });
  });
  describe('Given a page with a title and no id', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({title: 'the title'} as Page)).toBe(false);
        expect(isPage({title: 'the title', id: ''} as Page)).toBe(false);
      });
    });
  });
  describe('Given a page with a title and invalid id', () => {
    describe('When called', () => {
      test('Then it returns false', () => {
        expect(isPage({title: 'the title', id: 123})).toBe(false);
        expect(isPage({title: 'the title', id: {prop: 'value'}})).toBe(false);
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
        expect(isPage([{title: 'the title', id: 'the id'} as Page])).toBe(
          false
        );
      });
    });
  });
});
