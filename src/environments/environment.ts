import packageJson from '../../package.json';

export const environment = {
  production: false,
  apiUrl: 'https://trilobit.onrender.com',
  appVersion: packageJson.version,
};
