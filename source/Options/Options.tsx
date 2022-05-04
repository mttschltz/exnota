import * as React from 'react';
import {
  Anchor,
  Grommet,
  Image,
  Heading,
  Page,
  PageContent,
  TextInput,
  Box,
  Header,
  Paragraph,
  Form,
  FormField,
  Button,
} from 'grommet';
import {browser} from 'webextension-polyfill-ts';
import {useCallback, useState} from 'react';
import {BackgroundType} from 'grommet/utils';

type StepLabelState = 'complete' | 'active' | 'upcoming';

const StepLabel: React.FC<{
  num: string;
  label: string;
  state: StepLabelState;
}> = ({label, num, state}) => {
  let background: BackgroundType;
  switch (state) {
    case 'active':
      background = 'brand';
      break;
    case 'complete':
      background = 'status-ok';
      break;
    case 'upcoming':
      background = 'status-unknown';
      break;
    default:
      throw new Error('Unhandled step label state');
  }
  return (
    <Box direction="row" align="center" gap="xsmall">
      <Box
        round="full"
        background={background}
        width="2em"
        height="2em"
        justify="center"
        align="center"
      >
        {browser.i18n.getMessage(num)}
      </Box>
      {browser.i18n.getMessage(label)}
    </Box>
  );
};


const InstructionsHeading: React.FC = ({ children }) => {
  return <Heading level={3} size="5" margin={{bottom: 'small'}}>{children}</Heading>
}

const InstructionsDescription: React.FC = ({children}) => {
  return <Paragraph margin={{top: 'none', bottom: 'medium'}} fill={true}>{children}</Paragraph>
}

const InstructionsColumns: React.FC = ({children}) => {
  return <Box direction='row' gap="medium" margin={{bottom: "medium"}}>{children}</Box>
}

const InstructionsColumnText: React.FC = ({children}) => {
  return <Box basis='50%' flex={{shrink: 0}}>
    {children}
  </Box>
}
const InstructionsColumnImage: React.FC = ({children}) => {
  return <Box border="all" alignSelf="start">
  {children}
</Box>
}

const InstructionsStep: React.FC<{index: number}> = ({children, index}) => {
  return (
    <Paragraph margin={{top: "none", bottom: 'medium'}}>{browser.i18n.getMessage(`setupInstruction${index}`)}{children}</Paragraph>
  )
}
              
                
                

type Step = 'connect' | 'select' | 'start';

const Options: React.FC = () => {
  const [step] = useState<Step>('connect');
  const stateConfig = useState<string | undefined>(undefined)
  const setIntegrationToken = stateConfig[1]

  const stepLabelState = useCallback(
    (label: Step): StepLabelState => {
      switch (step) {
        case 'connect':
          switch (label) {
            case 'connect':
              return 'active';
            default:
              return 'upcoming';
          }
        case 'select':
          switch (label) {
            case 'connect':
              return 'complete';
            case 'select':
              return 'active';
            default:
              return 'upcoming';
          }
        case 'start':
          switch (label) {
            case 'connect':
            case 'select':
              return 'complete';
            default:
              return 'active';
          }
        default:
          throw new Error('Unhandled step type');
      }
    },
    [step]
  );
  return (
    <Grommet plain>
      <Page kind="narrow">
        <PageContent>
          <Header>
            <Box>
              <Heading level="1" size="2">
                {browser.i18n.getMessage('setup.title')}
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
          <Box
            direction="row"
            background="light-2"
            pad="small"
            justify="between"
          >
            <StepLabel
              state={stepLabelState('connect')}
              num="setup.connectStepNumber"
              label="setup.connectStepLabel"
            />
            <StepLabel
              state={stepLabelState('select')}
              num="setup.selectStepNumber"
              label="setup.selectStepLabel"
            />
            <StepLabel
              state={stepLabelState('start')}
              num="setup.startStepNumber"
              label="setup.startStepTitle"
            />
          </Box>
          {step === 'connect' && (
            <Box>
              <Heading level={2} size="2" margin={{bottom: "xxsmall"}}>
                {browser.i18n.getMessage('setup.connectTitle')}
              </Heading>
              <Paragraph fill={true} margin={{top: 'none'}}>{browser.i18n.getMessage('setup.connectDescription')}</Paragraph>
              <Box round="small" pad="small" border="all" margin={{bottom: "large"}}>{browser.i18n.getMessage('setup.connectAdminReminder')}</Box>
              <InstructionsHeading>{browser.i18n.getMessage('setup.connectAdminReminder')}</InstructionsHeading>
              <InstructionsColumns>
                <InstructionsColumnText>
                  <InstructionsStep index={1}>Log in to the workspace where your highlights should be saved.</InstructionsStep>
                  <InstructionsStep index={2}>Go to <Anchor href='https://www.notion.com/my-integrations'>https://www.notion.com/my-integrations</Anchor>.</InstructionsStep>
                  <InstructionsStep index={3}>Click the "+ New integration" button.</InstructionsStep>
                </InstructionsColumnText>
                <InstructionsColumnImage>
                  <Image
                  src="../assets/setup/connect-3-new-integration-wide.png"
                  />
                </InstructionsColumnImage>
              </InstructionsColumns>

              <InstructionsHeading>Name and select workspace</InstructionsHeading>
              <InstructionsColumns>
                <InstructionsColumnText>
                  <InstructionsStep index={4}>
                    Name this integration, e.g. "Exnota Highlights".
                  </InstructionsStep>
                  <InstructionsStep index={5}>
                    Select the workspace where you want highlights to be saved.
                  </InstructionsStep>
                </InstructionsColumnText>
                <InstructionsColumnImage>
                  <Image
                  src="../assets/setup/connect-4-5-name-and-workspace.png"
                />
                </InstructionsColumnImage>
              </InstructionsColumns>

              <InstructionsHeading>Configure capabilities</InstructionsHeading>
              <InstructionsDescription>Capabilities determine what actions Exnota can perform in your workspace. Content Capabilities will only apply to pages you explicitly give Exnota access to in the next step.</InstructionsDescription>
              <InstructionsColumns>
                <InstructionsColumnText>
                  <InstructionsStep index={6}>
                    Under "Capabilities > Content Capabilities", check all "Content Capabilities" boxes, so your highlights can be saved.
                  </InstructionsStep>
                  <InstructionsStep index={7}>
                  Under "Capabilities > User Capabilities", select "No user information".
                  </InstructionsStep>
                </InstructionsColumnText>
                <InstructionsColumnImage>
                  <Image
                  src="../assets/setup/connect-6-7-capabilities.png"
                />
                </InstructionsColumnImage>
              </InstructionsColumns>

              <InstructionsHeading>Get the token</InstructionsHeading>
              <InstructionsColumns>
                <InstructionsColumnText>
                  <InstructionsStep index={8}>Click "Submit".</InstructionsStep>
                </InstructionsColumnText>
                <InstructionsColumnImage>
                  <Image
                  src="../assets/setup/connect-8-submit-wide.png"
                />
                </InstructionsColumnImage>
              </InstructionsColumns>
              <InstructionsColumns>
                <InstructionsColumnText>
                  <InstructionsStep index={9}>
                    Copy the "Internal Integration Token" on the next page and paste it below.
                  </InstructionsStep>
                </InstructionsColumnText>
                <InstructionsColumnImage>
                  <Image
                  src="../assets/setup/connect-9-copy-token-blur.png"
                />
                </InstructionsColumnImage>
              </InstructionsColumns>
            </Box>
          )}
            <Form<{ integrationToken?: string }>
              value={{integrationToken: undefined}}
              onChange={({ integrationToken }) => setIntegrationToken(integrationToken)}
              // onSubmit={({ value }) => setIntegrationToken(value.integrationToken)}
            >
              <Box width="medium">
                {/* TODO: Update label */}
                <FormField name="integrationToken" htmlFor="integrationToken" label="Internal Integration Token">
                  <TextInput id="integrationToken" name="integrationToken" />
                </FormField>
              </Box>
              <Box direction="row" gap="medium" justify='end'>
                {/* TODO: Update label */}
                <Button type="submit" primary label="Next" />
              </Box>
            </Form>
        </PageContent>
      </Page>
    </Grommet>
  );
};

export default Options;
