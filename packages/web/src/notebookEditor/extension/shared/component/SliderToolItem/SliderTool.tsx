import { Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react';
import { ChangeEventHandler, KeyboardEventHandler } from 'react';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/sidebar/toolbar/type';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';
import { InputToolItemContainer } from '../InputToolItemContainer';

// ********************************************************************************
interface Props {
  name: string;
  value: number;

  /** the range of the Slider */
  minValue: number;
  maxValue: number;

  /** the increments for the step in the Slider */
  step: number;

  /** the decimals that the number will be round to */
  fixedDecimals?: number;

  onChange: (value: number, focus?: boolean) => void;
}
export const SliderTool: React.FC<Props> = ({ name, value, step, minValue, maxValue, fixedDecimals, onChange }) => {
  // == State =====================================================================
  const { commitChange, localValue, updateLocalValue } = useLocalValue(value, onChange);
  // NOTE: in the case that the input value is in an invalid state (e.g. empty) the
  //       localValue will be NaN, the value will be set to he minValue in the
  //       on this case.
  const isInvalid = isNaN(localValue);

  // == Handler ===================================================================
  const saveChange = (focus: boolean = true) => {
    // gets the value into a valid range and the correct number of decimals)
    const parsedValue = Math.max(minValue, Math.min(maxValue, Number(localValue.toFixed(fixedDecimals))));
    // set the minValue in case of invalid value
    const isInvalid = isNaN(parsedValue);
    const value = isInvalid ? minValue : parsedValue;

    updateLocalValue(value);
    commitChange(value, focus);
  };

  // -- Slider --------------------------------------------------------------------
  const handleSliderChange = (normalizedValue: number) => {
    // parses the number in the given range
    const parsedValue = Number((normalizedValue * (maxValue - minValue) / 100 + minValue).toFixed(fixedDecimals));
    updateLocalValue(parsedValue);
  };

  // -- Input --------------------------------------------------------------------
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    const parsedValue = parseFloat(value);

    updateLocalValue(parsedValue);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // save changes when user presses Enter
    if(event.key === 'Enter') {
      // prevent defaults so that PM does not handle the event
      event.preventDefault();
      event.stopPropagation();

      // save change
      saveChange();
    } /* else -- ignore */
  };

  // == UI ========================================================================
  // gets the value into a range from 0 to 100 using the given range
  const sliderNormalizedValue = (localValue - minValue) / (maxValue - minValue) * 100;
  const normalizedStep = Math.round((step - minValue) / (maxValue - minValue) * 100);
  return (
    <InputToolItemContainer
      name={name}
      rightContent={
        <Input
          textAlign='right'
          size='sm'
          type='number'
          paddingX={1}
          value={isInvalid ? '' : localValue}
          onBlur={() => saveChange(false)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      }
    >
      <Slider
        focusThumbOnChange={false/*do not focus sliderThumb on node selection*/}
        step={normalizedStep}
        value={isInvalid ? minValue : sliderNormalizedValue}
        marginY='10px'
        onChange={handleSliderChange}
        onChangeEnd={() => saveChange(true)}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>

        <SliderThumb datatype={TOOL_ITEM_DATA_TYPE} />
      </Slider>
    </InputToolItemContainer>
  );
};

