import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Paper, List, ListItem, ListItemText } from '@mui/material';

// 创建局部主题（没有背景的覆盖）
const localTheme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          transition: 'none',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

export default localTheme;