import {isPage, Page} from './page';

interface OptionsConfig {
  page: Page;
  readonly setPage: (page: Page) => void;
}

const isOptionsConfig = (
  optionsConfig: unknown
): optionsConfig is OptionsConfig => {
  if (typeof optionsConfig !== 'object' || optionsConfig === null) {
    return false;
  }

  const page =
    typeof optionsConfig === 'object'
      ? (optionsConfig as Partial<OptionsConfig>)?.page
      : undefined;
  return isPage(page);
};

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
export {isOptionsConfig, newOptionsConfig};
