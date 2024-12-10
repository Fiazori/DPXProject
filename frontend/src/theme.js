import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // 默认更透明
          transition: 'background-color 0.3s ease', // 平滑过渡效果
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // 悬停时更不透明
          },
        },
      },
    },
  },
});

export default theme;
