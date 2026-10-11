import packageJson from '../../package.json';

export const environment = {
  production: true,
  apiUrl: 'https://trilobit.onrender.com',
  appVersion: packageJson.version,
};
