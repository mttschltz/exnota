import * as React from 'react';
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
  Stack,
  Form,
} from 'grommet';
import {browser} from 'webextension-polyfill-ts';
import {useState} from 'react';
import {hpe} from 'grommet-theme-hpe';
import {Translate, useTranslate} from '../util/i18n';
import {options as optionsConfig} from '../util/options';

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

type Options = Parameters<typeof optionsConfig['setAll']>[0];

const Options: React.FC = () => {
  const t = useTranslate(['setup']);
  const [showTokenError] = useState(false);

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
          <Stack>
            <Form>
              <FormField label={t('setup:connect.integrationTokenLabel')}>
                <TextInput
                  id="notionIntegrationToken"
                  name="notionIntegrationToken"
                />
              </FormField>
              {showTokenError && (
                <Text color="status-critical">
                  {t('setup:connect.integrationTokenMissing')}
                </Text>
              )}
            </Form>
          </Stack>
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
        </PageContent>
      </Page>
    </Grommet>
  );
};

export default Options;
