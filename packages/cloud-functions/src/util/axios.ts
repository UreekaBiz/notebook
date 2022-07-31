import { AxiosError } from 'axios';

// ********************************************************************************
export const isAxiosError = (error: any): error is AxiosError => (error as AxiosError).isAxiosError === true;

// ================================================================================
export const isNotFoundError = (error: any) => {
  if(!isAxiosError(error)) return false/*not an Axios error so can't check*/;

  // the message format is "Request failed with status code 404"
  return /404$/.test(error.message);
};

export const isTooManyRequestsError = (error: any) => {
  if(!isAxiosError(error)) return false/*not an Axios error so can't check*/;

  // the message format is "Request failed with status code 429"
  return /429$/.test(error.message);
};

export const isBadGatewayError = (error: any) => {
  if(!isAxiosError(error)) return false/*not an Axios error so can't check*/;

  // the message format is "Request failed with status code 502"
  return /502$/.test(error.message);
};
