import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { ConfigEnv, UserConfig } from 'vite'

export default defineConfig(async ({ mode }: ConfigEnv): Promise<UserConfig> => {
    await new Promise((res) => setTimeout(res, 2000));
    const env = loadEnv(mode, process.cwd(), 'VITE')
    const apiUrl = env.VITE_API_URL || 'http://localhost:5000';
    const allowedHosts = env.VITE_ALLOWED_HOSTS || 'blog.cmmv.io';

    const generateProxyConfig = () => {
        const proxyConfig: Record<string, any> = {
            '/api': {
                target: apiUrl,
                changeOrigin: true,
                secure: false,
                configure: (proxy: any) => {
                    proxy.on('proxyReq', (proxyReq: any, req: any) => {
                        const refreshToken = req.headers['refresh-token'];

                        if (refreshToken)
                            proxyReq.setHeader('refresh-token', refreshToken);
                    });
                },
                rewrite: (path: string) => path.replace(/^\/api/, '')
            },
            '/images': {
                target: apiUrl,
                changeOrigin: true,
                secure: false
            }
        };

        return proxyConfig;
    };

    return {
        plugins: [vue()],
        build: {
            chunkSizeWarningLimit: 1000000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vue': ['vue', 'vue-router', 'pinia']
                    }
                }
            }
        },
        ssr: {
            noExternal: []
        },
        resolve: {
            preserveSymlinks: true
        },
        server: {
            allowedHosts: allowedHosts.split(',').map(host => host.trim()),
            port: Number(env.VITE_PORT) || 5002,
            host: "0.0.0.0",
            proxy: generateProxyConfig()
        },
    }
})
