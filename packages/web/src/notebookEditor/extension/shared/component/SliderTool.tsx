import { Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack } from '@chakra-ui/react';

import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';
import { ToolContainer } from 'notebookEditor/toolbar/ToolbarContainer';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';

// ********************************************************************************
type SliderMarkValue = {
  /** the position of the mark from 0-100 */
  value: number;
  /** the label of the mark */
  label: string;
};
interface Props {
  name: string;
  value: number;
  step: number/*amount by which the slider changes from 1-100*/;
  sliderMarkValues: SliderMarkValue[];
  onChange: (value: number) => void;
}

export const SliderTool: React.FC<Props> = ({ name, value, step = 10, sliderMarkValues, onChange }) => {
  // == State =====================================================================
  const { commitChange, localValue, updateLocalValue } = useLocalValue(value, onChange);

  // == Handlers ==================================================================
  const handleSliderChange = (value: number) => {
    updateLocalValue(value);
  };

  const handleChangeEnd = (value: number) => {
    commitChange(value);
  };

  // == UI ========================================================================
  return (
    <ToolContainer name={name}>
      <Slider
        focusThumbOnChange={false/*do not focus sliderThumb on node selection*/}
        step={step}
        value={localValue}
        marginY='10px'
        onChange={handleSliderChange}
        onChangeEnd={handleChangeEnd}
      >
        {sliderMarkValues.map((sliderMarkValue, index) =>
          <SliderMark
            key={index}
            value={sliderMarkValue.value}
            marginTop='1'
            marginLeft='-2.5'
            fontSize='sm'
          >
            {sliderMarkValue.label}
          </SliderMark>
        )}
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>

        <SliderThumb datatype={TOOL_ITEM_DATA_TYPE} />
      </Slider>
    </ToolContainer>
  );
};

