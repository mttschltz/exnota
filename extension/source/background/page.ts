import {Result, resultError, resultOk} from '@lib/result';

interface Page {
  id: string;
  name: string;
}

type PageError = 'invalid-id' | 'missing-name';

class PageImpl implements Page {
  _id: string;

  _name: string;

  public constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }
}

const newPage = (id: string, name: string): Result<Page, PageError> => {
  if (!id) {
    return resultError('Missing id', 'invalid-id', undefined, {id});
  }
  if (!name) {
    return resultError('Missing name', 'missing-name', undefined, {id});
  }
  return resultOk(new PageImpl(id, name));
};

export type {Page};
export {newPage};
