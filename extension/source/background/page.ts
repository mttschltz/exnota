import {Result, resultError, resultOk} from '@lib/result';

interface Page {
  id: string;
}

type PageError = 'invalid-id';

class PageImpl implements Page {
  _id: string;

  public constructor(id: string) {
    this._id = id;
  }

  public get id(): string {
    return this._id;
  }
}

const newPage = (id: string): Result<Page, PageError> => {
  if (!id) {
    return resultError('Missing id', 'invalid-id', undefined, {id});
  }
  return resultOk(new PageImpl(id));
};

export type {Page};
export {newPage};
