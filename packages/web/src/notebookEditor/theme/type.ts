// ********************************************************************************
// == Color =======================================================================
export type Color = { name: string; hexCode: string; hslCode: string; key?: string; };
export const colorToHexColor = (color: string): string => '#'.concat(color);
export const removeColorAddon = (color: string): string => color.replace(/^#/, '');

// 10x8 Color list (matches Google Docs)
// NOTE: these colors have no key since they are not meant to be set through
//       any Keyboard Shortcut interaction
export const googleDocsColors: Color[][] = [
  [
    { name: 'black', hexCode: '#000000', hslCode: '0% 0% 0%', key: '' },
    { name: 'dark grey 4', hexCode: '#434343', hslCode: '0, 0%, 50%', key: '' },
    { name: 'dark grey 3', hexCode: '#666666', hslCode: '0, 0%, 40%', key: '' },
    { name: 'dark grey 2', hexCode: '#999999', hslCode: '0, 0%, 60%', key: '' },
    { name: 'dark grey 1', hexCode: '#B7B7B7', hslCode: '0, 0%, 72%', key: '' },
    { name: 'grey', hexCode: '#CCCCCC', hslCode: '0, 0%, 80%', key: '' },
    { name: 'light grey', hexCode: '#D9D9D9', hslCode: '0, 0%, 85%', key: '' },
    { name: 'light grey 2', hexCode: '#EFEFEF', hslCode: '0, 0%, 94%', key: '' },
    { name: 'light grey 3', hexCode: '#F3F3F3', hslCode: '0, 0%, 95%', key: '' },
    { name: 'white', hexCode: '#FFFFFF', hslCode: '0, 0%, 100%', key: '' },
  ],
  [
    { name: 'red berry', hexCode: '#980000', hslCode: '0, 100%, 30%', key: '' },
    { name: 'red', hexCode: '#FF0000', hslCode: '0, 100%, 50%', key: '' },
    { name: 'orange', hexCode: '#FF9900', hslCode: '36, 100%, 50%', key: '' },
    { name: 'yellow', hexCode: '#FFFF00', hslCode: '60, 100%, 50%', key: '' },
    { name: 'green', hexCode: '#00FF00', hslCode: '120, 100%, 50%', key: '' },
    { name: 'cyan', hexCode: '#00FFFF', hslCode: '180, 100%, 50%', key: '' },
    { name: 'cornflower blue', hexCode: '#4A86E8', hslCode: '217, 77%, 60%', key: '' },
    { name: 'blue', hexCode: '#0000FF', hslCode: '240, 100%, 50%', key: '' },
    { name: 'purple', hexCode: '#9900FF', hslCode: '276, 100%, 50%', key: '' },
    { name: 'magenta', hexCode: '#FF00FF', hslCode: '300, 100%, 50%', key: '' },
  ],
  [
    { name: 'light red berry 3', hexCode: '#E6B8AF', hslCode: '10, 52%, 79%', key: '' },
    { name: 'light red 3', hexCode: '#F4CCCC', hslCode: '0, 65%, 88%', key: '' },
    { name: 'light orange 3', hexCode: '#FCE5CD', hslCode: '31, 89%, 90%', key: '' },
    { name: 'light yellow 3', hexCode: '#FFF2CC', hslCode: '45, 100%, 90%', key: '' },
    { name: 'light green 3', hexCode: '#D9EAD3', hslCode: '104, 35%, 87%', key: '' },
    { name: 'light cyan 3', hexCode: '#D0E0E3', hslCode: '189, 25%, 85%', key: '' },
    { name: 'light cornflower blue 3', hexCode: '#C9DAF8', hslCode: '218, 77%, 88%', key: '' },
    { name: 'light blue 3', hexCode: '#CFE2F3', hslCode: '208, 60%, 88%', key: '' },
    { name: 'light purple 3', hexCode: '#D9D2E9', hslCode: '268, 34%, 87%', key: '' },
    { name: 'light magenta 3', hexCode: '#EAD1DC', hslCode: '334, 37%, 87%', key: '' },
  ],
  [
    { name: 'light red berry 2', hexCode: '#DD7E6B', hslCode: '10, 63%, 64%', key: '' },
    { name: 'light red 2', hexCode: '#EA9999', hslCode: '0, 66%, 76%', key: '' },
    { name: 'light orange 2', hexCode: '#F9CB9C', hslCode: '30, 89%, 79%', key: '' },
    { name: 'light yellow 2', hexCode: '#FFE599', hslCode: '45, 100%, 80%', key: '' },
    { name: 'light green 2', hexCode: '#B6D7A8', hslCode: '102, 37%, 75%', key: '' },
    { name: 'light cyan 2', hexCode: '#A2C4C9', hslCode: '188, 27%, 71%', key: '' },
    { name: 'light cornflower blue 2', hexCode: '#A4C2F4', hslCode: '218, 78%, 80%', key: '' },
    { name: 'light blue 2', hexCode: '#9FC5E8', hslCode: '209, 61%, 77%', key: '' },
    { name: 'light purple 2', hexCode: '#B4A7D6', hslCode: '257, 36%, 75%', key: '' },
    { name: 'light magenta 2', hexCode: '#D5A6BD', hslCode: '331, 36%, 74%', key: '' },
  ],
  [
    { name: 'light red berry 1', hexCode: '#CC4125', hslCode: '10, 69%, 47%', key: '' },
    { name: 'light red 1', hexCode: '#E06666', hslCode: '0, 66%, 64%', key: '' },
    { name: 'light orange 1', hexCode: '#F6B26B', hslCode: '31, 89%, 69%', key: '' },
    { name: 'light yellow 1', hexCode: '#FFD966', hslCode: '45, 100%, 70%', key: '' },
    { name: 'light green 1', hexCode: '#93C47D', hslCode: '101, 38%, 63%', key: '' },
    { name: 'light cyan 1', hexCode: '#76A5AF', hslCode: '191, 26%, 57%', key: '' },
    { name: 'light cornflower blue 1', hexCode: '#6D9EEB', hslCode: '217, 76%, 67%', key: '' },
    { name: 'light blue 1', hexCode: '#6FA8DC', hslCode: '209, 61%, 65%', key: '' },
    { name: 'light purple 1', hexCode: '#8E7CC3', hslCode: '255, 37%, 63%', key: '' },
    { name: 'light magenta 1', hexCode: '#C27BA0', hslCode: '329, 37%, 62%', key: '' },
  ],
  [
    { name: 'dark red berry 1', hexCode: '#A61C00', hslCode: '10, 100%, 33%', key: '' },
    { name: 'dark red 1', hexCode: '#CC0000', hslCode: '0, 100%, 40%', key: '' },
    { name: 'dark orange 1', hexCode: '#E69138', hslCode: '31, 78%, 56%', key: '' },
    { name: 'dark yellow 1', hexCode: '#F1C232', hslCode: '45, 87%, 57%', key: '' },
    { name: 'dark green 1', hexCode: '#6AA84F', hslCode: '102, 36%, 48%', key: '' },
    { name: 'dark cyan 1', hexCode: '#45818E', hslCode: '191, 35%, 41%', key: '' },
    { name: 'dark cornflower blue 1', hexCode: '#3C78D8', hslCode: '217, 67%, 54%', key: '' },
    { name: 'dark blue 1', hexCode: '#3D85C6', hslCode: '208, 55%, 51%', key: '' },
    { name: 'dark purple 1', hexCode: '#674EA7', hslCode: '257, 36%, 48%', key: '' },
    { name: 'dark magenta 1', hexCode: '#A64D79', hslCode: '330, 37%, 48%', key: '' },
  ],
  [
    { name: 'dark red berry 2', hexCode: '#85200C', hslCode: '10, 83%, 28%', key: '' },
    { name: 'dark red 2', hexCode: '#990000', hslCode: '0, 100%, 30%', key: '' },
    { name: 'dark orange 2', hexCode: '#B45F06', hslCode: '31, 94%, 36%', key: '' },
    { name: 'dark yellow 2', hexCode: '#BF9000', hslCode: '45, 100%, 37%', key: '' },
    { name: 'dark green 2', hexCode: '#38761D', hslCode: '102, 61%, 29%', key: '' },
    { name: 'dark cyan 2', hexCode: '#134f5C', hslCode: '191, 66%, 22%', key: '' },
    { name: 'dark cornflower blue 2', hexCode: '#1155CC', hslCode: '218, 85%, 43%', key: '' },
    { name: 'dark blue 2', hexCode: '#0B5394', hslCode: '208, 86%, 31%', key: '' },
    { name: 'dark purple 2', hexCode: '#351C75', hslCode: '257, 61%, 28%', key: '' },
    { name: 'dark magenta 2', hexCode: '#741B47', hslCode: '330, 62%, 28%', key: '' },
  ],
  [
    { name: 'dark red berry 3', hexCode: '#5B0F00', hslCode: '10, 100%, 18%', key: '' },
    { name: 'dark red 3', hexCode: '#660000', hslCode: '0, 100%, 20%', key: '' },
    { name: 'dark orange 3', hexCode: '#783F04', hslCode: '31, 94%, 24%', key: '' },
    { name: 'dark yellow 3', hexCode: '#7F6000', hslCode: '45, 100%, 25%', key: '' },
    { name: 'dark green 3', hexCode: '#274E13', hslCode: '100, 61%, 19%', key: '' },
    { name: 'dark cyan 3', hexCode: '#0C343D', hslCode: '191, 67%, 14%', key: '' },
    { name: 'dark cornflower blue 3', hexCode: '#1C4587', hslCode: '217, 66%, 32%', key: '' },
    { name: 'dark blue 3', hexCode: '#073763', hslCode: '209, 87%, 21%', key: '' },
    { name: 'dark purple 3', hexCode: '#20124D', hslCode: '254, 62%, 19%', key: '' },
    { name: 'dark magenta 3', hexCode: '#4C1130', hslCode: '328, 63%, 18%', key: '' },
  ],
];

// 5x3 Color List that includes keys. Matches Excalidraw
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

// 5x3 Color List that includes keys and the transparent Color
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

export const DEFAULT_UNIT_VALUE = 10;
export const DEFAULT_UNIT = Unit.Pixel;

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
