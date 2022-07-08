import * as React from 'react';
import {
  Grommet,
  Image,
  Heading,
  Page as GrommetPage,
  PageContent,
  Box,
  Header,
  Paragraph,
  Spinner,
  Button,
  Text,
  Anchor,
  RadioButtonGroup,
} from 'grommet';
import {browser} from 'webextension-polyfill-ts';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {hpe} from 'grommet-theme-hpe';
import {useTranslate, Translate} from '@background/ui/i18n/i18n';
import {connect, getClientId} from '@background/service/message/auth';
import {Page} from '@background/page';
import {setPage} from '@background/service/message/options';

const ErrorWithDetails: React.FC<{
  message: string;
  code: string;
  customMessage?: string;
}> = ({message, code, customMessage}) => {
  const t = useTranslate(['setup']);
  return (
    <Box>
      {customMessage && (
        <Paragraph margin="none" color="status-critical">
          {customMessage}
        </Paragraph>
      )}
      <Paragraph margin="none" color="status-critical" size="small">
        {t('setup:error_summary', {
          code,
          message,
        })}
      </Paragraph>
    </Box>
  );
};

interface ConnectionState {
  readonly initializingConnection: boolean;
  state: 'no-code' | 'no-token';
  readonly error?: string; // TODO: Update when there are error messages
}

interface GetConnectionState {
  readonly loading: boolean;
  readonly screen:
    | ConnectStartScreen
    | ConnectStep1Screen
    | ConnectStep2Screen
    | ConnectSelectPageScreen
    | null;
}

type ScreenType =
  | 'connect-start'
  | 'connect-step1'
  | 'connect-step2'
  | 'connect-select-page';

interface ConnectStartScreen {
  readonly __type: 'connect-start';
  readonly start: () => void;
}
interface ConnectStep1Screen {
  readonly __type: 'connect-step1';
  readonly next: () => void;
}
interface ConnectStep2Screen {
  readonly __type: 'connect-step2';
  readonly connecting: boolean;
  readonly giveAccess: () => void;
  readonly error?: string;
}
interface ConnectSelectPageScreen {
  readonly __type: 'connect-select-page';
  readonly pages: Page[];
  readonly selecting: boolean;
  readonly selectedPageId: string | undefined;
  readonly setSelectedPage: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  readonly save: () => Promise<void>;
  readonly error?: string;
}

const useConnectStep2Screen = (
  setScreenType: React.Dispatch<React.SetStateAction<ScreenType | null>>,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
): ConnectStep2Screen => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);
  const t = useTranslate(['setup']);

  const giveAccess: ConnectStep2Screen['giveAccess'] = useCallback(async () => {
    setConnecting(true);
    setError(undefined);

    const redirectURL = browser.identity.getRedirectURL();
    let clientId;

    try {
      const clientIdResult = await getClientId();
      if (!clientIdResult.ok) {
        setError(
          t('setup:connect.step2_clientid_error', {
            code: clientIdResult.errorType,
          })
        );
        setConnecting(false);
        return;
      }
      clientId = clientIdResult.value;
    } catch {
      setError(t('setup:connect.step2_generic_error'));
      setConnecting(false);
      return;
    }

    try {
      const responseURL = await browser.identity.launchWebAuthFlow({
        interactive: true,
        url: `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectURL
        )}&response_type=code`,
      });

      const paramStr = responseURL.split('?')[1];
      if (!paramStr) {
        setError(t('setup:connect.step2_generic_error'));
        setConnecting(false);
        return;
      }

      const params = new URLSearchParams(paramStr);
      const code = params.get('code');
      console.log(`code=${code}`);

      if (!code) {
        // TODO: Customize error?
        setError(t('setup:connect.step2_generic_error'));
        setConnecting(false);
        return;
      }
      const connectResult = await connect(code, redirectURL);
      if (!connectResult.ok) {
        switch (connectResult.errorType) {
          case 'no-pages-granted':
            // TODO: handle this
            setError(t('setup:connect.step2_no_pages'));
            break;
          default:
            setError(
              t('setup:connect.step2_generic_error', {
                code: connectResult.errorType,
              })
            );
            break;
        }
        setConnecting(false);
        return;
      }

      setConnecting(false);
      if (connectResult.value.status === 'page-set') {
        // TODO:
      } else if (connectResult.value.status === 'multiple-pages') {
        setPages(
          connectResult.value.pages.sort((a, b) =>
            a.title.localeCompare(b.title)
          )
        );
        setScreenType('connect-select-page');
      }
    } catch {
      setError(t('setup:connect.step2_denied_access'));
      setConnecting(false);
    }
  }, [setPages, setScreenType, t]);

  const screen: ConnectStep2Screen = useMemo(() => {
    return {
      __type: 'connect-step2',
      giveAccess,
      error,
      connecting,
    };
  }, [connecting, error, giveAccess]);

  return screen;
};

const useConnectSelectPageScreen = (pages: Page[]): ConnectSelectPageScreen => {
  const [selecting, setSelecting] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(
    pages[0]?.id
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const t = useTranslate(['setup']);

  useEffect(() => {
    if (selectedPageId === undefined && pages.length > 0) {
      setSelectedPageId(pages[0]?.id);
    }
  }, [selectedPageId, pages]);

  const screen: ConnectSelectPageScreen = useMemo(() => {
    return {
      __type: 'connect-select-page',
      selecting,
      pages,
      selectedPageId,
      setSelectedPage: (event): void => {
        setSelectedPageId(event.target.value);
      },
      error,
      save: async (): Promise<void> => {
        setSelecting(true);
        const title = pages.find((p) => p.id === selectedPageId)?.title;

        if (!title || !selectedPageId) {
          setSelecting(false);
          setError(t('setup:connect.select_page_generic_error'));
          return;
        }

        const result = await setPage(selectedPageId, title);
        if (!result.ok) {
          setSelecting(false);
          setError(
            t('setup:connect.step2_generic_error', {
              code: result.errorType,
            })
          );
        }
        // TODO: Next screen
      },
    };
  }, [error, pages, selectedPageId, selecting, t]);
  return screen;
};

const useGetConnectionState = (): GetConnectionState => {
  const [loading] = useState(false); // TODO: Default to true
  const [state] = useState<ConnectionState | null>({
    // TODO: Default to null
    initializingConnection: true,
    state: 'no-code',
  });
  const [screen, setScreen] = useState<GetConnectionState['screen'] | null>(
    null
  );
  const [screenType, setScreenType] = useState<ScreenType | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  const connectStartScreen: ConnectStartScreen = useMemo(
    () => ({
      __type: 'connect-start',
      start: (): void => setScreenType('connect-step1'),
    }),
    []
  );
  const connectStep1Screen: ConnectStep1Screen = useMemo(
    () => ({
      __type: 'connect-step1',
      next: (): void => setScreenType('connect-step2'),
    }),
    []
  );
  const connectStep2Screen = useConnectStep2Screen(setScreenType, setPages);
  const connectSelectPageScreen = useConnectSelectPageScreen(pages);

  // Update screen type on state change
  useEffect(() => {
    switch (state?.state) {
      case 'no-code':
        setScreenType('connect-start');
        break;
      default:
        break;
    }
  }, [connectStartScreen, state?.state]);

  // Update screen on screen type change
  useEffect(() => {
    switch (screenType) {
      case 'connect-start':
        setScreen(connectStartScreen);
        break;
      case 'connect-step1':
        setScreen(connectStep1Screen);
        break;
      case 'connect-step2':
        setScreen(connectStep2Screen);
        break;
      case 'connect-select-page':
        setScreen(connectSelectPageScreen);
        break;
      default:
        break;
    }
  }, [
    screenType,
    connectStartScreen,
    connectStep1Screen,
    connectStep2Screen,
    connectSelectPageScreen,
  ]);

  // TODO: Get state from message API
  // useEffect(() => {
  //   const getTokenAsync = async (): Promise<void> => {
  //     const result = await getToken();

  //     if (!result.ok) {
  //       setGetTokenError(result);
  //     } else {
  //       setFetchedToken(result.value);
  //     }
  //     setLoading(false);
  //   };
  //   getTokenAsync();
  // }, []);

  return {
    loading,
    screen,
  };
};

const StepHeading: React.FC<{
  heading: Parameters<ReturnType<typeof useTranslate>>[0];
}> = ({heading: translation}) => {
  const t = useTranslate(['setup']);

  return (
    <Heading level={1}>
      <Box direction="column">
        <Text size="small" weight="normal">
          {t('setup:connect.step_heading')}
        </Text>
        <Text size="xlarge">{t(translation)}</Text>
      </Box>
    </Heading>
  );
};

const Options: React.FC = () => {
  const t = useTranslate(['setup']);
  const connectionState = useGetConnectionState();

  return (
    <Grommet theme={hpe}>
      <GrommetPage kind="narrow" pad={{bottom: 'xlarge'}}>
        <PageContent>
          <Header justify="center">
            <Box align="center" direction="row" gap="xsmall">
              <Image
                width="36px"
                height="36px"
                src="../assets/icons/favicon-48x48.png"
              />{' '}
              <Heading level="3" size="4" alignSelf="center">
                {browser.i18n.getMessage('extensionName')}
              </Heading>
            </Box>
          </Header>
          {/* TODO: Replace with loading state from message API */}
          {connectionState.loading && (
            <Box
              align="center"
              justify="center"
              height={{height: 'medium', max: '50vh'}}
            >
              <Spinner />
            </Box>
          )}
          {/* TODO: Replace with loading state from message API */}
          {!connectionState.loading && !connectionState.screen && (
            <ErrorWithDetails
              customMessage={t('setup:loading.error')}
              message={'missing error'}
              code={'missing error'}
            />
          )}
          {!connectionState.loading &&
            connectionState.screen?.__type === 'connect-start' && (
              <Box
                direction="column"
                height={{min: '50vh'}}
                justify="center"
                align="center"
              >
                <Paragraph>{t('setup:connect.start_description')}</Paragraph>
                <Box>
                  <Button
                    primary
                    label={t('setup:connect.start_button')}
                    onClick={connectionState.screen.start}
                  />
                </Box>
              </Box>
            )}
          {!connectionState.loading &&
            connectionState.screen?.__type === 'connect-step1' && (
              // Using Box instead of div causes margins to not collapse
              <div>
                <StepHeading heading="setup:connect.step1_heading" />
                <Paragraph>
                  <Translate i18nKey="connect.step1_description_1">
                    Open{' '}
                    <Anchor target="_blank" href="https://www.notion.com">
                      Notion
                    </Anchor>{' '}
                    and create a page for Exnota to save highlights to.
                  </Translate>
                </Paragraph>
                <Paragraph>{t('setup:connect.step1_description_2')}</Paragraph>
                <Box justify="end" align="center" gap="xsmall" direction="row">
                  <Text>{t('setup:connect.step1_confirm')}</Text>
                  <Button
                    primary
                    label={t('common:action.next')}
                    onClick={connectionState.screen.next}
                  />
                </Box>
              </div>
            )}
          {!connectionState.loading &&
            connectionState.screen?.__type === 'connect-step2' && (
              // Using Box instead of div causes margins to not collapse
              <div>
                <StepHeading heading="setup:connect.step2_heading" />
                <Paragraph>
                  <Translate i18nKey="connect.step2_description">
                    Click <Text weight="bold">Give access</Text> to open a
                    window where Notion allows you to give Exnota access to the
                    page where it should save highlights to.
                  </Translate>
                </Paragraph>
                {connectionState.screen.error && (
                  <Paragraph color="status-critical">
                    {connectionState.screen.error}
                  </Paragraph>
                )}
                <Box justify="end" align="center" gap="xsmall" direction="row">
                  {connectionState.screen.connecting && <Spinner />}
                  <Button
                    primary
                    label={
                      connectionState.screen.connecting
                        ? t('setup:connect.step2_try_again')
                        : t('setup:connect.step2_give_access')
                    }
                    onClick={connectionState.screen.giveAccess}
                  />
                </Box>
              </div>
            )}
          {!connectionState.loading &&
            connectionState.screen?.__type === 'connect-select-page' && (
              // Using Box instead of div causes margins to not collapse
              <div>
                <StepHeading heading="setup:connect.select_page_heading" />
                <Paragraph>
                  {t('setup:connect.select_page_description')}
                </Paragraph>
                {connectionState.screen.error && (
                  <Paragraph color="status-critical">
                    {connectionState.screen.error}
                  </Paragraph>
                )}
                {/* TODO: Add scrollable radio button group with all pages */}
                <Box
                  justify="between"
                  align="center"
                  gap="xsmall"
                  direction="row"
                >
                  <RadioButtonGroup
                    name="page"
                    options={connectionState.screen.pages.map((p) => ({
                      value: p.id,
                      label: p.title,
                    }))}
                    value={connectionState.screen.selectedPageId}
                    onChange={connectionState.screen.setSelectedPage}
                  />
                  <Box direction="row">
                    {connectionState.screen.selecting && <Spinner />}
                    <Button
                      primary
                      label={
                        connectionState.screen.selecting
                          ? t('setup:connect.select_page_try_again')
                          : t('setup:connect.select_page_finish')
                      }
                      onClick={connectionState.screen.save}
                    />
                  </Box>
                </Box>
              </div>
            )}
        </PageContent>
      </GrommetPage>
    </Grommet>
  );
};

export default Options;
