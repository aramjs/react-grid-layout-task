import { createUseStyles } from 'react-jss';

export const useGridLayoutContainerStyles = createUseStyles(
  {
    header: {
      textAlign: 'center',
    },
    cardContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid black',
      backgroundColor: 'lightgray',
      userSelect: 'none',
    },
  },
  { name: 'GridLayoutContainer' }
);

export const useLayoutItemMenuStyles = createUseStyles<'container', { x: number; y: number }>(
  {
    container: {
      position: 'absolute',
      backgroundColor: 'white',
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      top: props => props.y,
      left: props => props.x,
    },
  },
  { name: 'LayoutItemMenu' }
);
