import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { Component, ErrorInfo, ReactNode } from 'react';

import { getLogger, Logger } from '@ureeka-notebook/web-service';

import { coreRoutes } from 'shared/routes';

const log = getLogger(Logger.DEFAULT);

// REF: https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/error_boundaries/
// ******************************************************************************************
interface Props { children: ReactNode; }
interface State { hasError: boolean; }
class ErrorBoundary extends Component<Props, State> {
  // == State =====================================================================
  public state: State = { hasError: false/*no error by default*/ };
  public static getDerivedStateFromError(_: Error): State {
    // update state so the next render will show the fallback UI
    return { hasError: true/*by definition*/ };
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
          <Link href={coreRoutes.root}>
            <Button onClick={() => this.setState({ hasError: true })} marginTop={5}>Go back to main page</Button>
          </Link>
        </Box>
      </Flex>
    );
  }
}

export default ErrorBoundary;
