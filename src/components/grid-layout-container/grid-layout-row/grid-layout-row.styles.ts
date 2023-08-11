import { createUseStyles } from 'react-jss';

export const useGridLayoutRowStyles = createUseStyles<'container', { zIndex: number; isSelected: boolean }>(
  {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid black',
      userSelect: 'none',
      transition: 'none',
      zIndex: props => props.zIndex,
      backgroundColor: props => (props.isSelected ? 'gray' : 'lightgray'),
    },
  },
  { name: 'GridLayoutRow' }
);
