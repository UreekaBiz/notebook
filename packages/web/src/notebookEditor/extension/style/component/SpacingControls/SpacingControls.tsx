import { Box, Flex } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

import { isMarginAttribute, getOppositeSpacingAttribute, AttributeType, InvalidMergedAttributeValue, Margin, MarginAttribute, Padding, PaddingAttribute, SpacingAttribute, SpacingType } from '@ureeka-notebook/web-service';

import { DragControl } from './DragControl';

// ********************************************************************************
interface Props {
  margin: Margin;
  padding: Padding;

  onChange: (attribute: AttributeType, value: string) => void;
  name: string;
}
export const SpacingControls: React.FC<Props> = ({ margin, padding, name, onChange }) => {
  const [localState, setLocalState] = useState<Partial<Record<SpacingAttribute, string>>>({/*empty*/});
  const [movingType, setMovingType] = useState<SpacingAttribute | null>(null/*initial value*/);
  const [updateOpposites, setUpdateOpposites] = useState(false/*by default*/);
  const [updateAll, setUpdateAll] = useState(false/*by default*/);

  // ------------------------------------------------------------------------------
  const syncRelatedValues = useCallback((newValue: string | undefined, updateAll: boolean, updateOpposites: boolean) => {
    if(!movingType) return/*nothing to do*/;
    setLocalState(prevValue => {
      const value = newValue ?? prevValue[movingType];

      let updatedValues = {};
      if(updateAll) {
        if(isMarginAttribute(movingType)) {
          updatedValues = {
            [AttributeType.MarginTop]: value,
            [AttributeType.MarginBottom]: value,
            [AttributeType.MarginLeft]: value,
            [AttributeType.MarginRight]: value,
          };
        } else { /*padding*/
          updatedValues = {
            [AttributeType.PaddingTop]: value,
            [AttributeType.PaddingBottom]: value,
            [AttributeType.PaddingLeft]: value,
            [AttributeType.PaddingRight]: value,
          };
        }
      } else if(updateOpposites) {
        updatedValues = {
          [movingType]: value,
          [getOppositeSpacingAttribute(movingType)]: value,
        };
      } /* else -- update individual */
      return { ...prevValue, ...updatedValues };
    });
  }, [movingType]);

  // == Effects ===================================================================
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setUpdateAll(event.shiftKey);
      setUpdateOpposites(event.altKey);
      syncRelatedValues(undefined/*no value*/, event.shiftKey, event.altKey);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      setUpdateAll(event.shiftKey);
      setUpdateOpposites(event.altKey);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [syncRelatedValues]);

  // In a collaborative environment the valueWithUnit could change while a user is
  // changing this value, for this reason a local value must be stored and the
  // distinction on updating must be made, the value will be updated only when the
  // user is not updating.
  useEffect(() => {
    if(movingType/*essentially is moving*/) return/*nothing to do*/;

    // sync value and unit
    setLocalState({/*empty -- reset*/});

    // Explicitly ignore isMoving since this only depends on valueWithUnit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movingType]);

  // == Handlers ==================================================================
  const handleEnd = () => {
    for(let key in localState) {
      const attribute = key as SpacingAttribute;
      onChange(attribute, localState[attribute]!);
    }
    setMovingType(null/*reset state*/);
  };

  const handleChange = useCallback((attribute: SpacingAttribute, value: string) => {
    setMovingType(attribute);

    setLocalState(prevValue => ({ ...prevValue, [attribute]: value }));
    syncRelatedValues(value, updateAll, updateOpposites);
  }, [syncRelatedValues, updateAll, updateOpposites]);

  const getValue = (type: SpacingType, attribute: SpacingAttribute) => {
    const mergedValue = type === 'margin' ? margin[attribute as MarginAttribute] : padding[attribute as PaddingAttribute];
    const editorValue = mergedValue === InvalidMergedAttributeValue ? undefined : mergedValue;
    return localState[attribute] ?? editorValue ?? '';
  };

  // == UI ========================================================================
  return (
    <Box>
      {name}
      <Flex>
        margin-top:
        <DragControl
          valueWithUnit={getValue('margin', AttributeType.MarginTop)}
          direction='vertical'
          onChange={value => handleChange(AttributeType.MarginTop, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        margin-bottom:
        <DragControl
          valueWithUnit={getValue('margin', AttributeType.MarginBottom)}
          direction='vertical'
          onChange={value => handleChange(AttributeType.MarginBottom, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        margin-left:
        <DragControl
          valueWithUnit={getValue('margin', AttributeType.MarginLeft)}
          direction='horizontal'
          onChange={value => handleChange(AttributeType.MarginLeft, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        margin-right:
        <DragControl
          valueWithUnit={getValue('margin', AttributeType.MarginRight)}
          direction='horizontal'
          onChange={value => handleChange(AttributeType.MarginRight, value)} onEnd={handleEnd}
        />
      </Flex>

      <br/>

      <Flex>
        padding-top:
        <DragControl
          valueWithUnit={getValue('padding', AttributeType.PaddingTop)}
          direction='vertical'
          onChange={value => handleChange(AttributeType.PaddingTop, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        padding-bottom:
        <DragControl
          valueWithUnit={getValue('padding', AttributeType.PaddingBottom)}
          direction='vertical'
          onChange={value => handleChange(AttributeType.PaddingBottom, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        padding-left:
        <DragControl
          valueWithUnit={getValue('padding', AttributeType.PaddingLeft)}
          direction='horizontal'
          onChange={value => handleChange(AttributeType.PaddingLeft, value)} onEnd={handleEnd}
        />
      </Flex>
      <Flex>
        padding-right:
        <DragControl
          valueWithUnit={getValue('padding', AttributeType.PaddingRight)}
          direction='horizontal'
          onChange={value => handleChange(AttributeType.PaddingRight, value)} onEnd={handleEnd}
        />
      </Flex>
    </Box>
  );
};
