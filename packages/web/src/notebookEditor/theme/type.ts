// ********************************************************************************
// == Color =======================================================================
export type Color = { name: string; hexCode: string; hslCode: string; key?: string; };
export const colorToHexColor = (color: string): string => '#'.concat(color);
export const removeColorAddon = (color: string): string => color.replace(/^#/, '');

export const textColors: Color[][] = [
  [
    { name: 'black', hexCode: '#000000', hslCode: '0% 0% 0%', key: '1' },
    { name: 'blackGrey1', hexCode: '#343A40', hslCode: '210, 10%, 23%', key: '2' },
    { name: 'blackGrey2', hexCode: '#495057', hslCode: '210, 9%, 31%', key: '3' },
    { name: 'red1', hexCode: '#C92A2A', hslCode: '0, 65%, 48%', key: '4' },
    { name: 'purple1', hexCode: '#A61E4D', hslCode: '339, 69%, 38%', key: '5' },
  ],
  [
    { name: 'purple2', hexCode: '#862E9C', hslCode: '288, 54%, 40%', key: 'q' },
    { name: 'purple3', hexCode: '#5F3DC4', hslCode: '255, 53%, 50%', key: 'w' },
    { name: 'blue1', hexCode: '#364FC7', hslCode: '230, 57%, 50%', key: 'e' },
    { name: 'blue2', hexCode: '#1864AB', hslCode: '209, 75%, 38%', key: 'r' },
    { name: 'cyan1', hexCode: '#0B7285', hslCode: '189, 85%, 28%', key: 't' },
  ],
  [
    { name: 'green1', hexCode: '#087F5B', hslCode: '162, 88%, 26%', key: 'a' },
    { name: 'green2', hexCode: '#2B8A3E', hslCode: '132, 52%, 35%', key: 's' },
    { name: 'green3', hexCode: '#5C940D', hslCode: '85, 84%, 32%', key: 'd' },
    { name: 'orange1', hexCode: '#E67700', hslCode: '31, 100%, 45%', key: 'f' },
    { name: 'orange2', hexCode: '#D9480F', hslCode: '17, 87%, 45%', key: 'g' },
  ],
];

export const fillColors: Color[][] = [
  [
    { name: 'transparent', hexCode: 'transparent', hslCode: '0% 0% 0%', key: '1' },
    { name: 'grey1', hexCode: '#CED4DA', hslCode: '210, 14%, 83%', key: '2' },
    { name: 'grey2', hexCode: '#868E96', hslCode: '210, 9%, 31%', key: '3' },
    { name: 'pink1', hexCode: '#FA5252', hslCode: '0, 94%, 65%', key: '4' },
    { name: 'pink2', hexCode: '#E64980', hslCode: '339, 76%, 59%', key: '5' },
  ],
  [
    { name: 'purple1', hexCode: '#BE4BDB', hslCode: '288, 67%, 58%', key: 'q' },
    { name: 'purple2', hexCode: '#7950F2', hslCode: '255, 86%, 63%', key: 'w' },
    { name: 'blue1', hexCode: '#4C6EF5', hslCode: '228, 89%, 63%', key: 'e' },
    { name: 'blue2', hexCode: '#228BE6', hslCode: '208, 80%, 52%', key: 'r' },
    { name: 'cyan', hexCode: '#15AABF', hslCode: '187, 80%, 42%', key: 't' },
  ],
  [
    { name: 'green1', hexCode: '#12B886', hslCode: '162, 82%, 40%', key: 'a' },
    { name: 'green2', hexCode: '#40C057', hslCode: '131, 50%, 50%', key: 's' },
    { name: 'green3', hexCode: '#82C91E', hslCode: '85, 74%, 45%', key: 'd' },
    { name: 'orange1', hexCode: '#FAB005', hslCode: '42, 96%, 50%', key: 'f' },
    { name: 'orange2', hexCode: '#FD7E14', hslCode: '27, 98%, 54%', key: 'g' },
  ],
];

// == Units =======================================================================
export enum Unit {
  Pixel = 'px',
  Point = 'pt',
  Percentage = '%',
  Em = 'em',
  Rem = 'rem',
  Character = 'ch',
  ViewHeight = 'vh',
  ViewWidth = 'vw',
}
export const Units = Object.values(Unit);

// --------------------------------------------------------------------------------
export const getUnitFromString = (str: string): Unit | undefined => {
  let foundUnit: Unit | undefined = undefined;
  for(const unit of Units) {
    if(!str.includes(unit)) continue/*not a match -- keep looking*/;
    if(!foundUnit) { foundUnit = unit; continue; }

    // NOTE: this is needed for the case where the search matches 'rem' and 'em'.
    //       The algorithm must choose the one that fully selects the pattern
    if(unit.length > foundUnit.length) foundUnit = unit;
  }
  return foundUnit;
};

export const separateUnitFromString = (str: string): [string, (Unit | undefined)]=> {
  const unit = getUnitFromString(str);
  if(!unit) return [str, undefined];

  const [value] = str.split(unit);
  return [value, unit];
};

export const getNumberValueFromUnitString = (str: string = ''): number => {
  const [value] = separateUnitFromString(str);
  return Number(value ?? '0');
};
