import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vote.guide',
  integrations: [react()],
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
