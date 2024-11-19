// Define an interface for the configuration object
interface Config {
    url: string;
  }
  
  const production: Config = {
    url: 'https://kahanijsondata.azurewebsites.net',
  };
  
  const development: Config = {
    url: 'http://localhost:8080',
  };
  
  const isDevelopment: boolean = __DEV__; // __DEV__ is true when running in development mode in React Native
  
  // Export the configuration
  export const config: Config = production;
  
  // Optionally, you can use isDevelopment to choose between production and development configs
  // export const config: Config = isDevelopment ? development : production;