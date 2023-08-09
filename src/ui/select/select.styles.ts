import { createUseStyles } from 'react-jss';

export const useSelectStyles = createUseStyles(
  {
    container: {
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: `0px 5px 20px rgba(0, 0, 0, 0.3)`,
    },
    row: {
      padding: 10,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#EDF2F3',
      },
    },
    disabled: {
      pointerEvents: 'none',
      cursor: 'default',
      opacity: 0.5,
    },
  },
  { name: 'Select' }
);
