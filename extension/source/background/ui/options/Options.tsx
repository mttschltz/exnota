import * as React from 'react';
import {
  Grommet,
  Image,
  Heading,
  Page,
  PageContent,
  Box,
  Header,
  Paragraph,
  Spinner,
  Button,
} from 'grommet';
import {browser} from 'webextension-polyfill-ts';
import {useEffect, useMemo, useState} from 'react';
import {hpe} from 'grommet-theme-hpe';
import {useTranslate} from '@background/ui/i18n/i18n';

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
    | null;
}

type ScreenType = 'connect-start' | 'connect-step1' | 'connect-step2';

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
  readonly giveAccess: () => void;
}

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
  const connectStep2Screen: ConnectStep2Screen = useMemo(
    () => ({
      __type: 'connect-step2',
      giveAccess: (): void => {},
    }),
    []
  );

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
      default:
        break;
    }
  }, [screenType, connectStartScreen, connectStep1Screen, connectStep2Screen]);

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

const Options: React.FC = () => {
  const t = useTranslate(['setup']);
  const connectionState = useGetConnectionState();

  return (
    <Grommet theme={hpe}>
      <Page kind="narrow" pad={{bottom: 'xlarge'}}>
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
                <Paragraph>{t('setup:connect.description')}</Paragraph>
                <Box>
                  <Button
                    primary
                    label={t('setup:connect.start')}
                    onClick={connectionState.screen.start}
                  />
                </Box>
              </Box>
            )}
        </PageContent>
      </Page>
    </Grommet>
  );
};

export default Options;
