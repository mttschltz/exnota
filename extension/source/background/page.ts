import {Result, resultError, resultOk} from '@lib/result';

interface Page {
  id: string;
  title: string;
}

type PageError = 'invalid-id' | 'missing-title';

const isPage = (page: unknown): page is Page => {
  if (typeof page !== 'object' || page === null) {
    return false;
  }

  const result = newPage((page as Page)?.id, (page as Page)?.title);
  return result.ok;
};

class PageImpl implements Page {
  _id: string;

  _title: string;

  public constructor(id: string, title: string) {
    this._id = id;
    this._title = title;
  }

  public get id(): string {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }
}

const newPage = (id: string, title: string): Result<Page, PageError> => {
  if (!id || typeof id !== 'string') {
    return resultError('Missing id', 'invalid-id', undefined, {id});
  }
  if (!title || typeof title !== 'string') {
    return resultError('Missing title', 'missing-title', undefined, {id});
  }
  return resultOk(new PageImpl(id, title));
};

export type {Page};
export {newPage, isPage};
