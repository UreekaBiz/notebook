import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Component, ErrorInfo, ReactNode } from 'react';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

const log = getLogger(Logger.DEFAULT);

// REF: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/
// ******************************************************************************************
interface Props { children: ReactNode; }
interface State { hasError: boolean; redirect: boolean; }
class ErrorBoundary extends Component<Props, State> {
  // == State =====================================================================
  public state: State = { hasError: false/*no error by default*/, redirect:false/*no redirection by default*/ };
  public static getDerivedStateFromError(_: Error): State {
    // update state so the next render will show the fallback UI
    return { hasError: true/*by definition*/, redirect: false /*set to true on button click*/ };
  }

  // ==============================================================================
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('Error rendering react component:', error, errorInfo);
  }

  // == UI ========================================================================
  public render() {
    if(!this.state.hasError) return this.props.children;

    return (
      <Flex alignItems='center' flexDirection='column' justifyContent='center' width='full' height='full' backgroundColor='gray.200'>
        <Box textAlign='center' paddingX={6} paddingY={10}>
          {/* WIP: Commented while removing chakra-ui/icons <WarningTwoIcon boxSize='50px' color='red' /> */}
          <Heading as='h1' size='xl' marginTop={6} marginBottom={2}>Error</Heading>
          <Text color='gray.500'>There was an error loading the App</Text>
          <Button onClick={ () => this.setState({ hasError: true, redirect: true })} marginTop={5}>Go back to main page</Button>
          {/* FIXME: why is this commented out and with no comment?!? */}
          {/* { this.state.redirect && <Navigate to={`/${notebookRoutes.root}`} replace={true} />/*will redirect when rendered*/}
        </Box>
      </Flex>
    );
  }
}

export default ErrorBoundary;
