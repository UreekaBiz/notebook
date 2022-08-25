// ********************************************************************************
// wraps the given content in the given tag and then parses the result into a valid
// JSX element.
// NOTE: The Tag should match the Tag used to wrap the ContentDOMWrapper in the
//       NodeView for consistency.
export const getReactNodeFromJSX = (content: string, Tag: React.ElementType = 'div'): React.ReactNode =>
{
  // CHECK: Is this true? Who sanitizes the content?
  // NOTE: Is safe to use dangerouslySetInnerHTML because the content is already
  //       sanitized by XXX.
  return (<Tag dangerouslySetInnerHTML={{ __html: content }} />);
};
