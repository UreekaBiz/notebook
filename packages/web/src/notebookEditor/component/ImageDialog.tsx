import { useToast, Button, FormControl, FormLabel, FormErrorMessage, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { Editor } from '@tiptap/react';
import { useFormik, Field, FormikProvider } from 'formik';
import { useState } from 'react';
import * as Validate from 'yup';

import { urlSchema, DefaultImageAttributes } from '@ureeka-notebook/web-service';

import { useIsMounted } from 'shared/hook/useIsMounted';
import { fitImageDimension, getImageMeta } from 'notebookEditor/extension/image/util';
import { insertAndSelectImageCommand } from 'notebookEditor/extension/image/command';

// ********************************************************************************
// == Schema ======================================================================
// TODO: Move to a better place.
const ImageDialog_Create_Schema = Validate.object({
  /*the src of the image*/
  src: urlSchema
      .required(),
});
type ImageDialog_Create = Validate.InferType<typeof ImageDialog_Create_Schema>;

// == Component ===================================================================
interface Props {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}
export const ImageDialog: React.FC<Props> = ({ editor, isOpen, onClose }) => {
  // == State =====================================================================
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------------------
  const toast = useToast();
  const isMounted = useIsMounted();

  // == Handler ===================================================================
  // -- Form ----------------------------------------------------------------------
  const handleSubmit = async ({ src: value }: ImageDialog_Create) => {
    try {
      setIsLoading(true);
      const img = await getImageMeta(value);
      const { src, fittedWidth: width, fittedHeight: height } = fitImageDimension(img);

      insertAndSelectImageCommand({ ...DefaultImageAttributes, src, width, height })(editor.state, editor.view.dispatch);
    } catch(error) {
      console.error(`Error loading image for src (${value}). Reason: `, error);
      // REF: https://chromestatus.com/feature/5629709824032768
      // NOTE: CORB might cause the URL response to be invalid (SEE: REF above)
      if(!isMounted()) return/*nothing to do*/;

      toast({ title: 'Unexpected error happened while inserting image.', status: 'warning', duration: 3000/*ms*/ });
    } finally {
      if(!isMounted()) return/*nothing to do*/;

      setIsLoading(false);
      onClose();
    }
  };
  const formik = useFormik<ImageDialog_Create>({
    initialValues: { src: '' },
    validationSchema: ImageDialog_Create_Schema,
    onSubmit: handleSubmit,
  });

  // -- Dialog --------------------------------------------------------------------
  // TODO: Add some kind of AYS?
  const handleClose = () => {
    onClose();
  };

  // == UI ========================================================================
  return (
    <Modal isOpen={isOpen} onClose={onClose} onEsc={onClose}>
      <ModalOverlay />

      <ModalContent>
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <fieldset disabled={isLoading}>

              <ModalHeader>Add an image</ModalHeader>
              <ModalCloseButton onClick={onClose} />

              <ModalBody>
                <FormControl isInvalid={!!formik.errors.src}>
                  <FormLabel htmlFor='src'>Image url</FormLabel>
                  <Field
                    as={Input}
                    id='src'
                    name='src'
                    value={formik.values.src ?? ''/*explicit controlled component*/}
                    type='src'
                    variant='filled'
                    autoFocus
                  />
                  <FormErrorMessage>{formik.errors.src}</FormErrorMessage>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant='ghost'
                  colorScheme='blue'
                  isLoading={isLoading}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={status === 'loading' || !(formik.isValid && formik.dirty)}
                  type='submit'
                  colorScheme='purple'
                  width={120}
                >
                  {status === 'loading' ? 'Loading' : 'Create' }
                </Button>
              </ModalFooter>
            </fieldset>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
};
