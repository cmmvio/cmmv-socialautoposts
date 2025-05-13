import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const getEnv = (key: string): string | undefined => {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env)// @ts-ignore
        return import.meta.env[key]

    if (typeof process !== 'undefined' && process.env)
        return process.env[key]

    return undefined
}

const ssrLocalStorage: any =
    typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
          };

export function useApi() {
    const router = useRouter()
    const user = ref<any>(null)
    const token = ref<string | null>(ssrLocalStorage.getItem('token') || null)
    const refreshToken = ref<string | null>(ssrLocalStorage.getItem('refreshToken') || null)
    const isAuthenticated = computed(() => !!token.value)

    const getApiPath = (path: string) => {
        return `/api/${path}`;
    }

    const getHeaders = (headers?: object) => {
        const result = {
            Authorization: `Bearer ${token.value}`,
            ...headers,
        };

        return result;
    }

    const authRootRequest = async (path: string, method: string, payload?: any, headers?: object) => {
        return await authRequest(path, method, payload, headers, true);
    }

    const authRequest = async (
        path: string, method: string,
        payload?: any, headers?: object,
        isRoot?: boolean
    ) => {
        try {
            if (token.value && token.value !== 'null') {
                if (!headers) headers = {}

                let apiPath = isRoot ? `/api/${path}` : getApiPath(path);
                apiPath += (apiPath.includes("?")) ? `&t=${new Date().getTime()}` : `?t=${new Date().getTime()}`

                const response = await fetch(
                    apiPath,
                    method == 'GET'
                        ? {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token.value}`,
                                ...headers,
                            },
                        }
                        : {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token.value}`,
                                ...headers,
                            },
                            body: payload ? JSON.stringify(payload) : undefined,
                        },
                )

                const contentType = response.headers.get('content-type')?.split(';')[0]

                if (response.status !== 200)
                    return null;

                const data: any =
                    contentType === 'application/json' || contentType === 'text/json'
                        ? await response.json()
                        : await response.text()

                if (data.result) {
                    return {
                        status: response.status,
                        ...data.result,
                    }
                } else {
                    return data
                }
            } else {
                router.push('/login')
            }
        } catch (error) {
            return { status: 500, message: error }
        }
    }

    const login = async (credentials: { username: string; password: string; token?: string }) => {
        const response = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        const data: any = await response.json()

        if (response.ok && data.result.token) {
            ssrLocalStorage.setItem('token', data.result.token)
            ssrLocalStorage.setItem('refreshToken', data.result.refreshToken)
            token.value = data.result.token
            refreshToken.value = data.result.refreshToken
            return data.result
        } else {
            throw new Error(data.result.message || 'Login failed')
        }
    }

    const loginWithFirebase = async (credentials: { token: string; provider: string; user: any }) => {
        const response = await fetch(`/api/accounts/login/firebase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        })

        const data: any = await response.text()

        if (response.ok && data) {
            ssrLocalStorage.setItem('token', data)
            token.value = data
            return data
        } else {
            throw new Error(data.result.message || 'Login failed')
        }
    }

    const logout = () => {
        ssrLocalStorage.removeItem('token')
        ssrLocalStorage.removeItem('refreshToken')
        token.value = null
        refreshToken.value = null
        user.value = null
        router.push('/login')
    }

    const checkSession = async () => {
        const result = await authRequest('accounts/check', 'GET')

        if (!result){
            ssrLocalStorage.removeItem('token')
            ssrLocalStorage.removeItem('refreshToken')
            token.value = null
            refreshToken.value = null
            user.value = null
            router.push('/login')
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        getHeaders,
        authRequest,
        authRootRequest,
        checkSession,
        login,
        logout,
        loginWithFirebase
    }
}
