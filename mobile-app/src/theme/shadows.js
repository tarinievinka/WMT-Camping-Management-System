import { Platform } from 'react-native';

export const Shadows = {
  small: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  medium: Platform.select({
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
  }),
  large: Platform.select({
    web: {
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 10,
    },
  }),
  primary: (color) => Platform.select({
    web: {
      boxShadow: `0px 4px 10px ${color}4D`, // 4D is 30% alpha
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 8,
    },
  }),
};
