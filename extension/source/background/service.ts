import {Result} from '@lib/result';
import {Page} from './page';

type GetPageResponse = {
  page: Page;
};
type GetPageError =
  | 'service--get-page--no-page-access'
  | 'service--get-page--invalid-auth'
  | 'service--get-page--other';
type GetPageService = (
  id: string
) => Promise<Result<GetPageResponse, GetPageError>>;

type GetPagesError =
  | 'service--get-pages--invalid-auth'
  | 'service--get-pages--other';
type GetPagesService = () => Promise<Result<Page[], GetPagesError>>;

export type {GetPagesService, GetPageService, GetPageResponse, GetPageError};
