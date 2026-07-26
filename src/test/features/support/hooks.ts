import 'global-jsdom/register';
import { After } from '@cucumber/cucumber';
import { cleanup } from '@testing-library/react';

require.extensions['.css'] = function () {
  // CSS imports are a no-op outside of the Vite build used to run the app.
};

After(function () {
  cleanup();
});
