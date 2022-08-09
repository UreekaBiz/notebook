import { Select } from '@chakra-ui/react';
import { ChangeEventHandler } from 'react';

import { ShareRole } from '@ureeka-notebook/web-service';

import { getReadableNotebookRole } from 'user/type';

// == Constants ===================================================================
// sentinel valued used to identify when the 'remove' option is selected
const REMOVE_VALUE = 'remove';

// ********************************************************************************
interface Props {
  value: ShareRole;
  disabled: boolean;

  /** the 'Remove' option is displayed */
  canRemove?: boolean;

  /** disable Selector when value is 'Creator' */
  disableCreatorOption?: boolean;
  /** show the 'Creator' option? If the actual value is 'Creator' the option will be
   *  shown anyways */
  hideCreatorOption?: boolean;

  onChange: (role: ShareRole) => void;
  /** the remove option is selected */
  onRemove?: () => void;
}
export const NotebookRoleSelector: React.FC<Props> = ({ canRemove = false, disabled = false, disableCreatorOption = true, onChange, value, onRemove, hideCreatorOption = true }) => {
  // == Handler ===================================================================
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const { value } = event.target;

    if(value === REMOVE_VALUE) {
      if(onRemove) onRemove();
      return/*nothing left to do*/;
    } /* else -- a NotebookValue was selected */

    onChange(value as ShareRole/*by definition*/);
  };

  // == UI ========================================================================
  return (
    <Select
      disabled={disabled || disableCreatorOption && value === ShareRole.Creator}
      value={value}
      width={110}
      paddingInlineEnd={0}
      onChange={handleChange}
    >
      {/* empty value that serves as a placeholder */}
      <option value='' disabled>Role</option>
      {Object.values(ShareRole).map((role) => (
        // hides 'Creator' option if hideCreatorOption is true and the current value
        // if other than 'Creator'
        (hideCreatorOption && value !== ShareRole.Creator && role === ShareRole.Creator) ? null : (
          <option key={role} value={role}>
            {getReadableNotebookRole(role)}
          </option>
      )))}
      {canRemove && <option value={REMOVE_VALUE}>Remove</option>}
    </Select>
  );
};
