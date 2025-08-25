import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      define: {
        // 强制注入生产环境API地址
        'import.meta.env.VITE_GLOB_API_URL': JSON.stringify(
          process.env.NODE_ENV === 'production' 
            ? 'http://49.233.224.92:8095'  // 改为您的实际API地址
            : '/api'
        ),
        // 确保生产环境变量被正确识别
        'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
