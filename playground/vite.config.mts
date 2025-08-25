import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      define: {
        // 生产环境API地址配置
        'import.meta.env.VITE_GLOB_API_URL': JSON.stringify(
          process.env.NODE_ENV === 'production' 
            ? 'http://49.233.169.30:5000' 
            : '/api'
        ),
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
