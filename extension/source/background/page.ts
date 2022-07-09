import {Result, resultError, resultOk} from '@lib/result';

interface Page {
  id: string;
  title: string;
  url: string;
}

type PageError = 'invalid-id' | 'missing-title' | 'missing-url';

const isPage = (page: unknown): page is Page => {
  if (typeof page !== 'object' || page === null) {
    return false;
  }

  const result = newPage(
    (page as Page)?.id,
    (page as Page)?.title,
    (page as Page)?.url
  );
  return result.ok;
};

class PageImpl implements Page {
  _id: string;

  _title: string;

  _url: string;

  public constructor(id: string, title: string, url: string) {
    this._id = id;
    this._title = title;
    this._url = url;
  }

  public get id(): string {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }

  public get url(): string {
    return this._url;
  }
}

const newPage = (
  id: string,
  title: string,
  url: string
): Result<Page, PageError> => {
  if (!id || typeof id !== 'string') {
    return resultError('Missing id', 'invalid-id', undefined, {id});
  }
  if (!title || typeof title !== 'string') {
    return resultError('Missing title', 'missing-title', undefined, {id});
  }
  if (!url || typeof url !== 'string') {
    return resultError('Missing url', 'missing-url', undefined, {id});
  }
  return resultOk(new PageImpl(id, title, url));
};

export type {Page};
export {newPage, isPage};
