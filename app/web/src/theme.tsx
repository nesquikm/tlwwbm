import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#00B8FF',
    },
    secondary: {
      main: '#D600FF',
    },
    error: {
      main: red.A400,
    },
    mode: 'dark',
  },
});

export default theme;
