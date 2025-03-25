import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://squlio.edu.pl', 
    setupNodeEvents(on, config) {
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', 
  },
});