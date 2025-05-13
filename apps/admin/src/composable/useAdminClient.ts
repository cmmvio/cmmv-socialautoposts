import { useApi } from './useApi';

export const useAdminClient = () => {
    const api = useApi();

    const session = {
        loginWithFirebase: async (payload: any) => {
            return await api.loginWithFirebase(payload);
        },
        check: () => api.checkSession(),
        login: (data: { username: string; password: string }) => api.login(data),
        logout: () => api.logout(),
    }

    const profile = {
        get: async () => {
            return await api.authRequest('accounts/profile', 'GET');
        }
    }

    const feeds = {
        list: async (filters: Record<string, any>) => {
            const query = new URLSearchParams(filters).toString();
            return await api.authRequest(`feeds?${query}`, 'GET');
        },
        create: async (payload: any) => {
            return await api.authRequest('feeds', 'POST', payload);
        },
        update: async (id: string, payload: any) => {
            return await api.authRequest(`feeds/${id}`, 'PUT', payload);
        },
        delete: async (id: string) => {
            return await api.authRequest(`feeds/${id}`, 'DELETE');
        }
    }

    const shortlinks = {
        list: async (filters: Record<string, any>) => {
            const query = new URLSearchParams(filters).toString();
            return await api.authRequest(`shortlinks?${query}`, 'GET');
        },
        create: async (payload: any) => {
            return await api.authRequest('shortlinks', 'POST', payload);
        },
        update: async (id: string, payload: any) => {
            return await api.authRequest(`shortlinks/${id}`, 'PUT', payload);
        }
    }

    const queue = {
        list: async (filters: Record<string, any>) => {
            const query = new URLSearchParams(filters).toString();
            return await api.authRequest(`queue?${query}`, 'GET');
        },
        getDetails: async (id: string) => {
            return await api.authRequest(`feed-items/${id}`, 'GET');
        },
        updateStatus: async (id: string, processed: boolean) => {
            return await api.authRequest(`feed-items/${id}/status`, 'PUT', { processed });
        }
    }

    const socials = {
        list: async (filters: Record<string, any>) => {
            const query = new URLSearchParams(filters).toString();
            return await api.authRequest(`integrations?${query}`, 'GET');
        },
        delete: async (id: string) => {
            return await api.authRequest(`integrations/${id}`, 'DELETE');
        }
    }

    const facebook = {
        listPages: async (accessToken: string, state: string, uuid: string) => {
            const queries = new URLSearchParams({ accessToken, state, uuid }).toString();
            return await api.authRequest(`integration/facebook/list-pages?${queries}`, 'GET');
        },
        savePage: async (payload: any) => {
            return await api.authRequest('integration/facebook/save-page', 'POST', payload);
        },
        getPageImage: async (pageId: string, accessToken: string) => {
            const queries = new URLSearchParams({ pageId, accessToken }).toString();
            return await api.authRequest(`integration/facebook/get-page-image?${queries}`, 'GET');
        }
    }

    const instagram = {
        getUserInfo: async (accessToken: string) => {
            const queries = new URLSearchParams({ accessToken }).toString();
            return await api.authRequest(`integration/instagram/user-info?${queries}`, 'GET');
        },
        getUserMedia: async (accessToken: string) => {
            const queries = new URLSearchParams({ accessToken }).toString();
            return await api.authRequest(`integration/instagram/user-media?${queries}`, 'GET');
        },
        getProfilePicture: async (userId: string, accessToken: string) => {
            const queries = new URLSearchParams({ userId, accessToken }).toString();
            return await api.authRequest(`integration/instagram/profile-picture?${queries}`, 'GET');
        }
    }

    const twitter = {
        getUserInfo: async (accessToken: string) => {
            const queries = new URLSearchParams({ accessToken }).toString();
            return await api.authRequest(`integration/twitter/user-info?${queries}`, 'GET');
        },
        getUserTimeline: async (userId: string, accessToken: string) => {
            const queries = new URLSearchParams({ userId, accessToken }).toString();
            return await api.authRequest(`integration/twitter/user-timeline?${queries}`, 'GET');
        },
        postTweet: async (accessToken: string, text: string) => {
            return await api.authRequest('integration/twitter/post-tweet', 'POST', { accessToken, text });
        }
    }

    return {
        api,
        session,
        profile,
        feeds,
        shortlinks,
        queue,
        socials,
        facebook,
        instagram,
        twitter
    }
}
