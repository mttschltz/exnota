import * as React from 'react';
import {StatusGood, StatusPlaceholder} from 'grommet-icons';
import {
  Anchor,
  Grommet,
  Image,
  Heading,
  Page,
  PageContent,
  TextInput,
  Text,
  Box,
  Header,
  Paragraph,
  FormField,
  Form,
  Button,
} from 'grommet';
import {browser} from 'webextension-polyfill-ts';
import {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {hpe} from 'grommet-theme-hpe';
import {Translate, useTranslate} from '../util/i18n';
import {getToken, setToken} from '../background/message/notion';
import {FunctionError, ResultError} from '../util/result';

const Spinner: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        margin: 'auto',
        display: 'block',
        shapeRendering: 'auto',
      }}
      width="200px"
      height="200px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle
        cx="50"
        cy="50"
        fill="none"
        stroke="#1d0e0b"
        strokeWidth="10"
        r="35"
        strokeDasharray="164.93361431346415 56.97787143782138"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
        />
      </circle>
    </svg>
  );
};

const InstructionsHeading: React.FC = ({children}) => {
  return (
    <Heading level={3} size="5" margin={{bottom: 'small'}}>
      {children}
    </Heading>
  );
};

const InstructionsDescription: React.FC = ({children}) => {
  return (
    <Paragraph margin={{top: 'none', bottom: 'medium'}} fill={true}>
      {children}
    </Paragraph>
  );
};

const InstructionsColumns: React.FC = ({children}) => {
  return (
    <Box direction="row" gap="medium" margin={{bottom: 'medium'}}>
      {children}
    </Box>
  );
};

const InstructionsColumnText: React.FC = ({children}) => {
  return (
    <Box basis="50%" flex={{shrink: 0}}>
      {children}
    </Box>
  );
};
const InstructionsColumnImage: React.FC = ({children}) => {
  return (
    <Box border="all" alignSelf="start">
      {children}
    </Box>
  );
};

const InstructionsStep: React.FC = ({children}) => {
  return (
    <Paragraph margin={{top: 'none', bottom: 'medium'}}>{children}</Paragraph>
  );
};

interface GetToken {
  readonly loading: boolean;
  readonly token: string | undefined;
  readonly getTokenError: ResultError<FunctionError<typeof getToken>> | null;
}

const useGetToken = (): GetToken => {
  const [loading, setLoading] = useState(true);
  const [fetchedToken, setFetchedToken] =
    useState<string | undefined>(undefined);
  const [getTokenError, setGetTokenError] =
    useState<GetToken['getTokenError']>(null);

  useEffect(() => {
    const getTokenAsync = async (): Promise<void> => {
      const result = await getToken();

      if (!result.ok) {
        setGetTokenError(result);
      } else {
        setFetchedToken(result.value);
      }
      setLoading(false);
    };
    getTokenAsync();
  }, []);

  return {
    loading,
    token: fetchedToken,
    getTokenError,
  };
};

const TokenForm: React.FC<{token: string | undefined}> = ({
  token: initialFormToken,
}) => {
  const t = useTranslate(['setup']);

  const [formToken, setFormToken] = useState(initialFormToken);

  const [setTokenError, setSetTokenError] =
    useState<ResultError<FunctionError<typeof setToken>> | null>(null);
  const [showEmptyTokenError, setEmptyMissingTokenError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [valid, setValid] = useState(false);

  const onSubmit = useCallback(() => {
    const setTokenAsync = async (): Promise<void> => {
      if (!formToken) {
        setEmptyMissingTokenError(true);
        return;
      }
      setSaving(true);
      const result = await setToken(formToken);
      setSaving(false);

      if (!result.ok) {
        setSetTokenError(result);
      } else {
        setValid(true);
      }
    };
    setTokenAsync();
  }, [formToken]);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e): void => {
    setValid(false);
    setFormToken(e.currentTarget.value);
  };

  return (
    <Form onSubmit={onSubmit}>
      <Box direction="row">
        <FormField label={t('setup:token.label')} width="medium">
          <TextInput
            id="notionIntegrationToken"
            name="notionIntegrationToken"
            value={formToken}
            onChange={onChange}
          />
        </FormField>
        <Box alignSelf="end" pad={{left: 'small'}}>
          <Box
            direction="row"
            align="center"
            gap="small"
            margin={{bottom: '0.4rem'}}
          >
            {!valid && <StatusPlaceholder color="transparent" />}
            {valid && <StatusGood />}
            <Button
              type="submit"
              disabled={saving || valid}
              primary
              label={t('setup:token.save_and_test')}
            />
          </Box>
        </Box>
      </Box>

      {showEmptyTokenError && (
        <Text color="status-critical">{t('setup:token.error_empty')}</Text>
      )}
      {setTokenError?.errorType === 'notion-invalid-token' && (
        <Text color="status-critical">{t('setup:token.error_invalid')}</Text>
      )}
      {setTokenError?.errorType &&
        setTokenError?.errorType !== 'notion-invalid-token' && (
          <Text color="status-critical">
            {t('setup:token.error_summary', {
              code: setTokenError.errorType,
              description: setTokenError.message,
            })}
          </Text>
        )}
    </Form>
  );
};

const Options: React.FC = () => {
  const t = useTranslate(['setup']);
  const token = useGetToken();

  return (
    <Grommet theme={hpe}>
      <Page kind="narrow" pad={{bottom: 'xlarge'}}>
        <PageContent>
          <Header>
            <Box>
              <Heading level="1" size="2">
                {t('setup:title')}
              </Heading>
            </Box>
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
          {token.loading && <Spinner />}
          {!token.loading && token.getTokenError && (
            <Box>
              <Paragraph>{t('setup:loading.error')}</Paragraph>
              <Paragraph size="small">
                {t('setup:loading.error_summary', {
                  code: token.getTokenError.errorType,
                  description: token.getTokenError.message,
                })}
              </Paragraph>
            </Box>
          )}
          {!token.loading && !token.getTokenError && (
            <Box direction="column">
              <Box>
                <TokenForm token={token.token} />
              </Box>
              <Box>
                <Box>
                  <Heading level={2} size="2" margin={{bottom: 'xxsmall'}}>
                    {t('setup:connect.title')}
                  </Heading>
                  <Paragraph fill={true} margin={{top: 'none'}}>
                    {t('setup:connect.description')}
                  </Paragraph>
                  <Box
                    round="small"
                    pad="small"
                    border="all"
                    margin={{bottom: 'large'}}
                  >
                    {t('setup:connect.adminReminder')}
                  </Box>
                  <InstructionsHeading>
                    {t('setup:connect.createIntegrationTitle')}
                  </InstructionsHeading>
                  <InstructionsColumns>
                    <InstructionsColumnText>
                      <InstructionsStep>
                        {t('setup:connect.instruction1')}
                      </InstructionsStep>
                      <InstructionsStep>
                        <Translate i18nKey="connect.instruction2">
                          Go to{' '}
                          <Anchor href="https://www.notion.com/my-integrations">
                            https://www.notion.com/my-integrations
                          </Anchor>
                          .
                        </Translate>
                      </InstructionsStep>
                      <InstructionsStep>
                        {t('setup:connect.instruction3')}
                      </InstructionsStep>
                    </InstructionsColumnText>
                    <InstructionsColumnImage>
                      <Image src="../assets/setup/connect-3-new-integration-wide.png" />
                    </InstructionsColumnImage>
                  </InstructionsColumns>

                  <InstructionsHeading>
                    {t('setup:connect.createNameSelectTitle')}
                  </InstructionsHeading>
                  <InstructionsColumns>
                    <InstructionsColumnText>
                      <InstructionsStep>
                        {t('setup:connect.instruction4')}
                      </InstructionsStep>
                      <InstructionsStep>
                        {t('setup:connect.instruction5')}
                      </InstructionsStep>
                    </InstructionsColumnText>
                    <InstructionsColumnImage>
                      <Image src="../assets/setup/connect-4-5-name-and-workspace.png" />
                    </InstructionsColumnImage>
                  </InstructionsColumns>

                  <InstructionsHeading>
                    {t('setup:connect.configureCapabilitiesTitle')}
                  </InstructionsHeading>
                  <InstructionsDescription>
                    {t('setup:connect.configureCapabilitiesDescription')}
                  </InstructionsDescription>
                  <InstructionsColumns>
                    <InstructionsColumnText>
                      <InstructionsStep>
                        {t('setup:connect.instruction6')}
                      </InstructionsStep>
                      <InstructionsStep>
                        {t('setup:connect.instruction7')}
                      </InstructionsStep>
                    </InstructionsColumnText>
                    <InstructionsColumnImage>
                      <Image src="../assets/setup/connect-6-7-capabilities.png" />
                    </InstructionsColumnImage>
                  </InstructionsColumns>

                  <InstructionsHeading>
                    {t('setup:connect.getTokenTitle')}
                  </InstructionsHeading>
                  <InstructionsColumns>
                    <InstructionsColumnText>
                      <InstructionsStep>
                        {t('setup:connect.instruction8')}
                      </InstructionsStep>
                    </InstructionsColumnText>
                    <InstructionsColumnImage>
                      <Image src="../assets/setup/connect-8-submit-wide.png" />
                    </InstructionsColumnImage>
                  </InstructionsColumns>
                  <InstructionsColumns>
                    <InstructionsColumnText>
                      <InstructionsStep>
                        {t('setup:connect.instruction9')}
                      </InstructionsStep>
                    </InstructionsColumnText>
                    <InstructionsColumnImage>
                      <Image src="../assets/setup/connect-9-copy-token-blur.png" />
                    </InstructionsColumnImage>
                  </InstructionsColumns>
                </Box>
              </Box>
            </Box>
          )}
        </PageContent>
      </Page>
    </Grommet>
  );
};

export default Options;
