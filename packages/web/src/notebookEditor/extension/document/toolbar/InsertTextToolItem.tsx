import {  Button, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from '@chakra-ui/react';
import { stringMedSchema } from '@ureeka-notebook/service-common';
import { notebookEditorInsertText } from '@ureeka-notebook/web-service';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';
import { useState } from 'react';
import { useIsMounted } from 'shared/hook';
import * as Validate from 'yup';
import { useFormik, Field, FormikProvider } from 'formik';
import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';

// ********************************************************************************
// == Schema ======================================================================
// TODO: Move to a better place.
const InsertText_Create_Schema = Validate.object({
  text: stringMedSchema
      .required(),
});
type InsertText_Create = Validate.InferType<typeof InsertText_Create_Schema>;

interface Props extends EditorToolComponentProps {/*no additional*/}
export const InsertTextToolItem: React.FC<Props> = () => {
  const { notebookId } = useNotebookEditor();

  // == State =====================================================================
  const [isOpen, setIsOpen] = useState(false/*default*/);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------------------
  const toast = useToast();
  const isMounted = useIsMounted();

  // == Handler ===================================================================
  // -- Form ----------------------------------------------------------------------
  const handleSubmit = async ({ text }: InsertText_Create) => {
    try {
      setIsLoading(true);
      // FIXME: Not awaiting to see the change live.
      notebookEditorInsertText({ notebookId, text });

    } catch(error) {
      console.error(`Error inserting text (${text}). Reason: `, error);
      // REF: https://chromestatus.com/feature/5629709824032768
      if(!isMounted()) return/*nothing to do*/;

      toast({ title: 'Unexpected error happened while inserting link.', status: 'warning', duration: 3000/*ms*/ });
    } finally {
      if(!isMounted()) return/*nothing to do*/;

      setIsLoading(false);
      formik.resetForm();
      setIsOpen(false);
    }
  };
  const formik = useFormik<InsertText_Create>({
    initialValues: { text: '' },
    validationSchema: InsertText_Create_Schema,
    onSubmit: handleSubmit,
  });

  // -- Dialog --------------------------------------------------------------------
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    formik.resetForm();
    setIsOpen(false);
  };

  // == UI ========================================================================
  return (
    <>
      <Button colorScheme='gray' variant='ghost' size='sm' onClick={handleOpen}>Insert Text</Button>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} onEsc={handleClose}>
          <ModalOverlay />

          <ModalContent>
            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit}>
                <fieldset disabled={isLoading}>

                  <ModalHeader>Insert text</ModalHeader>
                  <ModalCloseButton onClick={handleClose} />

                  <ModalBody>
                    <FormControl isInvalid={!!formik.errors.text}>
                      <FormLabel htmlFor='text'>Text</FormLabel>
                      <Field
                        as={Input}
                        id='text'
                        name='text'
                        value={formik.values.text ?? ''/*explicit controlled component*/}
                        type='text'
                        variant='filled'
                        autoFocus
                      />
                      <FormErrorMessage>{formik.errors.text}</FormErrorMessage>
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
                      disabled={formik.status === 'loading' || !(formik.isValid && formik.dirty)}
                      type='submit'
                      colorScheme='purple'
                      width={120}
                    >
                      {formik.status === 'loading' ? 'Loading' : 'Create' }
                    </Button>
                  </ModalFooter>
                </fieldset>
              </form>
            </FormikProvider>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
