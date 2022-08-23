import { Box, FormControl, FormErrorMessage, Input } from '@chakra-ui/react';
import { useFormik, Field, FormikProvider } from 'formik';
import { KeyboardEventHandler } from 'react';
import * as Validate from 'yup';

import { isImageNode, isNodeSelection, urlSchema, AttributeType, NodeName } from '@ureeka-notebook/web-service';

import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Schema ======================================================================
// TODO: move to a better place
const ImageDialog_Create_Schema = Validate.object({
  /*the src of the image*/
  src: urlSchema
      .required(),
});
type ImageDialog_Create = Validate.InferType<typeof ImageDialog_Create_Schema>;

// ================================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ImageSrcToolItem: React.FC<Props> = ({ editor }) => {
  const { selection } = editor.state;
  const { pos: prevPos } = selection.$anchor;
  if(!isNodeSelection(selection) || !isImageNode(selection.node)) throw new Error(`Invalid ImageSrcToolItem render: ${JSON.stringify(selection)}`);

  const initialValue = selection.node.attrs[AttributeType.Src] ?? ''/*default*/;
  const formik = useFormik<ImageDialog_Create>({
    initialValues: { src: initialValue },
    validationSchema: ImageDialog_Create_Schema,

    // NOTE: not using onSubmit since the way the input is submitted must be handled
    //       by the caller in order to control the focus of the User
    onSubmit: () => {},
  });

  // == Handler ===================================================================
  // -- Form ----------------------------------------------------------------------
  // update the Attributes and select the previous position
  const handleSubmit = ({ src: value }: ImageDialog_Create, focusEditor: boolean) => {
    editor.chain()
          .updateAttributes(NodeName.IMAGE, { src: value })
          .setNodeSelection(prevPos)
          .run();

    // focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if(event.key !== 'Enter') return/*nothing to do*/;
    if(!formik.isValid) return/*nothing to do*/;

    // save changes when user presses enter
    event.preventDefault();
    event.stopPropagation();
    handleSubmit(formik.values, true/*focus editor*/);
  };

  const handleBlur = () => {
    if(formik.isValid) {
      handleSubmit(formik.values, false/*don't focus the editor*/);
      return;/*nothing else to do*/
    } /* else -- form is invalid */

    // reset to previous value
    formik.resetForm();
  };

  // == UI ========================================================================
  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <FormControl isInvalid={!!formik.errors.src}>
          <InputToolItemContainer name='SRC'>
            <Box width='full'>
              <Field
                as={Input}
                id='src'
                name='src'
                datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
                value={formik.values.src ?? ''/*explicit controlled component*/}
                autoComplete='off'
                placeholder='src'
                variant='outline'
                size='sm'
                width='full'
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
              />
              <FormErrorMessage>{formik.errors.src}</FormErrorMessage>
            </Box>
          </InputToolItemContainer>
        </FormControl>
      </form>
    </FormikProvider>
  );
};
