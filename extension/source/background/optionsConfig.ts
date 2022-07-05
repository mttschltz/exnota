import {Page} from './page';

interface OptionsConfig {
  page: Page;
  readonly setPage: (page: Page) => void;
}

class OptionsConfigImpl implements OptionsConfig {
  _page: Page;

  public constructor(page: Page) {
    this._page = page;
  }

  public get page(): Page {
    return this._page;
  }

  public setPage(page: Page): void {
    this._page = page;
  }
}

const newOptionsConfig = (page: Page): OptionsConfig => {
  return new OptionsConfigImpl(page);
};

export type {OptionsConfig};
export {newOptionsConfig};
