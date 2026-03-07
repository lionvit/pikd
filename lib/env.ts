export const ENV = (process.env.EXPO_PUBLIC_ENV ?? 'development') as
  | 'development'
  | 'staging'
  | 'production';

export const IS_PROD = ENV === 'production';
