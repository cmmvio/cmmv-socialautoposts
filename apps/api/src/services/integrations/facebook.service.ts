import { Service } from '@cmmv/core';
import { Repository } from '@cmmv/repository';

@Service("facebook")
export class FacebookService {
    protected graphUrl = "https://graph.facebook.com/v22.0";
    protected authUrl = "https://www.facebook.com/v22.0/dialog/oauth";

    /**
     * Get authorization URL
     * @param appId - The app ID
     * @param redirectUri - The redirect URI
     * @param scopes - The scopes
     * @returns The authorization URL
     */
    getAuthorizationUrl(state: string): string {
        const url = new URL(this.authUrl);
        url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID || "");
        url.searchParams.set("redirect_uri", `${process.env.FRONTEND_URL}/integration/facebook/callback?state=${state}`);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", "pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_posts,pages_manage_engagement");
        return url.toString();
    }

    /**
     * Exchange code for access token
     * @param code - The code to exchange
     * @param appId - The app ID
     * @param appSecret - The app secret
     * @param redirectUri - The redirect URI
     * @returns The access token
     */
    async exchangeCodeForToken(stateCode: string, code: string) {
        const url = new URL(`${this.graphUrl}/oauth/access_token`);
        url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID || "");
        url.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET || "");
        url.searchParams.set("redirect_uri", `${process.env.FRONTEND_URL}/integration/facebook/callback?state=${stateCode}`);
        url.searchParams.set("code", code);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error?.message || "Error exchanging code for token");

        const IntegrationsEntity = Repository.getEntity("IntegrationsEntity");
        const StateEntity = Repository.getEntity("StateEntity");

        const state = await Repository.findOne(StateEntity, {
            state: stateCode
        });

        if(!state)
            throw new Error("State not found");

        const integration = await Repository.insert(IntegrationsEntity, {
            type: "facebook",
            account: state.account,
            accessToken: data.access_token,
            image: data.avatar
        });

        await Repository.deleteMany(StateEntity, {
            state: stateCode
        });

        if(!integration)
            throw new Error("Integration not found");

        return `${process.env.FRONTEND_URL.replace("/api", "")}/select-page?state=${stateCode}&uuid=${integration.data.id}&accessToken=${data.access_token}`;
    }

    /**
     * List the pages of the user
     * @param userAccessToken - The user access token
     * @returns The pages
     */
    async listPages(userAccessToken: string) {
        const url = new URL(`${this.graphUrl}/me/accounts`);
        url.searchParams.set("access_token", userAccessToken);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error?.message || "Erro ao listar páginas");

        await Promise.all(data.data.map(async (page: any, index: number) => {
            const avatar = await this.getPageImage(page.id, userAccessToken);
            data.data[index].avatar = avatar;
        }));

        return data;
    }

    /**
     * Save a page
     * @param payload - The payload
     * @returns The page
     */
    async savePage(payload: any, accountId: string) {
        const IntegrationsEntity = Repository.getEntity("IntegrationsEntity");

        const integration = await Repository.findOne(IntegrationsEntity, {
            id: payload.uuid,
            account: accountId
        });

        if(!integration)
            throw new Error("Integration not found");

        await Repository.update(IntegrationsEntity, integration.id, {
            pageId: payload.pageId,
            name: payload.pageName,
            image: payload.avatar,
            pageAccessToken: payload.accessToken
        });

        return { success: true };
    }

    /**
     * Get the image of the page
     * @param pageId - The page ID
     * @param accessToken - The access token
     * @returns The image
     */
    async getPageImage(pageId: string, accessToken: string) {
        const url = new URL(`${this.graphUrl}/${pageId}/picture`);
        url.searchParams.set("access_token", accessToken);
        url.searchParams.set("type", "large");
        url.searchParams.set("redirect", "false");

        const res = await fetch(url.toString());
        const result = await res.json();

        if (!res.ok) throw new Error(result.error?.message || "Erro ao obter imagem da página");

        return result.data.url;
    }

    /**
     * Post to a page
     * @param pageId - The page ID
     * @param pageAccessToken - The user access token
     * @param message - The message to post
     * @returns The post
     */
    async postToPage(pageId: string, pageAccessToken: string, message: string, link?: string) {
        const postUrl = `${this.graphUrl}/${pageId}/feed`;
        const postRes = await fetch(postUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                message,
                link,
                published: "true",
                access_token: pageAccessToken
            })
        });

        const postData = await postRes.json();

        if (!postRes.ok) throw new Error(postData.error?.message || "Erro ao postar na página");

        return postData;
    }
}
