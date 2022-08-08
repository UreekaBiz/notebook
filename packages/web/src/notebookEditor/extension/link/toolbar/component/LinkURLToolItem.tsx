import { Box, Flex, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { getMarkAttributes } from '@tiptap/core';
import { useFormik, Field, FormikProvider } from 'formik';
import { KeyboardEventHandler } from 'react';
import * as Validate from 'yup';

import { isLinkMarkAttributes, urlSchema, AttributeType, MarkName  } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
// == Schema ======================================================================
// TODO: move to a better place
const LinkDialog_Create_Schema = Validate.object({
  /*the src of the Link*/
  href: urlSchema
      .required(),
});
type LinkDialog_Create = Validate.InferType<typeof LinkDialog_Create_Schema>;

// ================================================================================
interface Props extends EditorToolComponentProps {/*no additional*/}
export const LinkURLToolItem: React.FC<Props> = ({ editor }) => {
  const attrs = getMarkAttributes(editor.state, MarkName.LINK);
  const initialValue = attrs[AttributeType.Href] ?? ''/*default*/;

  const formik = useFormik<LinkDialog_Create>({
    initialValues: { href: initialValue },
    validationSchema: LinkDialog_Create_Schema,

    // NOTE: not using onSubmit since the way the input is submitted must be handled
    //       by the caller in order to control the focus of the User
    onSubmit: () => {},
  });

  if(!isLinkMarkAttributes(attrs)) return null/*nothing to render*/;


  // == Handler ===================================================================
  // -- Form ----------------------------------------------------------------------
  // update the Attributes and select the previous position
  const handleSubmit = ({ href }: LinkDialog_Create, focusEditor: boolean) => {
    const { pos: prevPos } = editor.state.selection.$anchor;
    editor.chain()
          .extendMarkRange(MarkName.LINK)
          .setLink({ ...attrs, href })
          .setTextSelection(prevPos)
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
    <Box>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Flex marginTop='5px'>
            <FormControl isInvalid={!!formik.errors.href}>
              <FormLabel htmlFor='href'>URL</FormLabel>
              <Field
                as={Input}
                id='href'
                name='href'
                datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
                value={formik.values.href ?? ''/*explicit controlled component*/}
                autoComplete='off'
                placeholder='href'
                variant='outline'
                size='sm'
                width='full'
                marginBottom='5px'
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
              />
              <FormErrorMessage>{formik.errors.href}</FormErrorMessage>
            </FormControl>
          </Flex>
        </form>
      </FormikProvider>
    </Box>
  );
};
