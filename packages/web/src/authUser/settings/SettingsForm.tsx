import { Button, FormControl, FormErrorMessage, FormLabel, Input, Spinner, VStack } from '@chakra-ui/react';
import { useFormik, Field, FormikProvider } from 'formik';

import { UserProfilePrivate_Update, UserProfilePrivate_Update_Schema } from '@ureeka-notebook/web-service';

import { AsyncStatus } from 'shared/hook';

// ********************************************************************************
interface Props {
  initialValues: UserProfilePrivate_Update;
  onSubmit: (values: UserProfilePrivate_Update) => void;

  status: AsyncStatus;
}
export const SettingsForm: React.FC<Props> = ({ initialValues, onSubmit, status }) => {
  // NOTE: Validation schema allows the fields to have an empty string but when
  //       submitting the schema on the server side throws an error, for this
  //       reason all empty string are converted to undefined.
  const handleSubmit = (values: UserProfilePrivate_Update) => {
    onSubmit({
      about: values.about || undefined,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      profileImageUrl: values.profileImageUrl || undefined,
      socialMedia_facebook: values.socialMedia_facebook || undefined,
      socialMedia_instagram: values.socialMedia_instagram || undefined,
      socialMedia_linkedin: values.socialMedia_linkedin || undefined,
      socialMedia_tiktok: values.socialMedia_tiktok || undefined,
      socialMedia_twitter: values.socialMedia_twitter || undefined,
      apiKeys: values.apiKeys || undefined,
    });
  };

  const formik = useFormik<UserProfilePrivate_Update>({
    initialValues,
    validationSchema: UserProfilePrivate_Update_Schema,
    onSubmit: handleSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <fieldset disabled={status === 'loading'}>
          <VStack spacing={4} align='flex-start'>
            <FormControl isInvalid={!!formik.errors.firstName}>
              <FormLabel htmlFor='firstName'>First Name</FormLabel>
              <Field as={Input} id='firstName' name='firstName' value={formik.values.firstName ?? ''/*explicit controlled component*/} type='firstName' variant='filled'/>
              <FormErrorMessage>{formik.errors.firstName}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!formik.errors.lastName}>
              <FormLabel htmlFor='lastName'>Last Name</FormLabel>
              <Field as={Input} id='lastName' name='lastName' value={formik.values.lastName ?? ''/*explicit controlled component*/} type='lastName' variant='filled'/>
              <FormErrorMessage>{formik.errors.lastName}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formik.errors.about}>
              <FormLabel htmlFor='about'>About</FormLabel>
              <Field as={Input} id='about' name='about' value={formik.values.about ?? ''/*explicit controlled component*/} type='about' variant='filled'/>
              <FormErrorMessage>{formik.errors.about}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formik.errors.profileImageUrl}>
              <FormLabel htmlFor='profileImageUrl'>Profile Image URL</FormLabel>
              <Field as={Input} id='profileImageUrl' name='profileImageUrl' value={formik.values.profileImageUrl ?? ''/*explicit controlled component*/} type='profileImageUrl' variant='filled'/>
              <FormErrorMessage>{formik.errors.profileImageUrl}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formik.errors.socialMedia_facebook}>
              <FormLabel htmlFor='socialMedia_facebook'>Social Media Facebook</FormLabel>
              <Field as={Input} id='socialMedia_facebook' name='socialMedia_facebook' value={formik.values.socialMedia_facebook ?? ''/*explicit controlled component*/} type='socialMedia_facebook' variant='filled'/>
              <FormErrorMessage>{formik.errors.socialMedia_facebook}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!formik.errors.socialMedia_instagram}>
              <FormLabel htmlFor='socialMedia_instagram'>Social Media Instagram</FormLabel>
              <Field as={Input} id='socialMedia_instagram' name='socialMedia_instagram' value={formik.values.socialMedia_instagram ?? ''/*explicit controlled component*/} type='socialMedia_instagram' variant='filled'/>
              <FormErrorMessage>{formik.errors.socialMedia_instagram}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!formik.errors.socialMedia_linkedin}>
              <FormLabel htmlFor='socialMedia_linkedin'>Social Media Linkedin</FormLabel>
              <Field as={Input} id='socialMedia_linkedin' name='socialMedia_linkedin' value={formik.values.socialMedia_linkedin ?? ''/*explicit controlled component*/} type='socialMedia_linkedin' variant='filled'/>
              <FormErrorMessage>{formik.errors.socialMedia_linkedin}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!formik.errors.socialMedia_tiktok}>
              <FormLabel htmlFor='socialMedia_tiktok'>Social Media Tiktok</FormLabel>
              <Field as={Input} id='socialMedia_tiktok' name='socialMedia_tiktok' value={formik.values.socialMedia_tiktok ?? ''/*explicit controlled component*/} type='socialMedia_tiktok' variant='filled'/>
              <FormErrorMessage>{formik.errors.socialMedia_tiktok}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!formik.errors.socialMedia_twitter}>
              <FormLabel htmlFor='socialMedia_twitter'>Social Media Twitter</FormLabel>
              <Field as={Input} id='socialMedia_twitter' name='socialMedia_twitter' value={formik.values.socialMedia_twitter ?? ''/*explicit controlled component*/} type='socialMedia_twitter' variant='filled'/>
              <FormErrorMessage>{formik.errors.socialMedia_twitter}</FormErrorMessage>
            </FormControl>

            <Button
              disabled={status === 'loading' || !(formik.isValid && formik.dirty)}
              type='submit'
              colorScheme='purple'
              width={120}
            >
              {status === 'loading' ? <Spinner /> : 'Update' }
            </Button>
          </VStack>
        </fieldset>
      </form>
    </FormikProvider>
  );
};
