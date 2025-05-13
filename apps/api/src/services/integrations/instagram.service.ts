import { Service } from '@cmmv/core';
import { Repository } from '@cmmv/repository';

@Service("instagram")
export class InstagramService {
    protected graphUrl = "https://graph.instagram.com";
    protected apiUrl = "https://api.instagram.com";
    protected authUrl = "https://api.instagram.com/oauth/authorize";

    /**
     * Get authorization URL
     * @param state - The state for CSRF protection
     * @returns The authorization URL
     */
    getAuthorizationUrl(state: string): string {
        const url = new URL(this.authUrl);
        url.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID || "");
        url.searchParams.set("redirect_uri", `${process.env.FRONTEND_URL}/integration/instagram/callback`);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", "user_profile,user_media");
        url.searchParams.set("state", state);
        return url.toString();
    }

    /**
     * Exchange code for access token
     * @param stateCode - The state code for verification
     * @param code - The code to exchange
     * @returns The redirect URL with access token
     */
    async exchangeCodeForToken(stateCode: string, code: string) {
        const url = new URL(`${this.apiUrl}/oauth/access_token`);

        const formData = new URLSearchParams();
        formData.append("client_id", process.env.INSTAGRAM_APP_ID || "");
        formData.append("client_secret", process.env.INSTAGRAM_APP_SECRET || "");
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", `${process.env.FRONTEND_URL}/integration/instagram/callback?state=${stateCode}`);
        formData.append("code", code);

        const res = await fetch(url.toString(), {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error_message || "Error exchanging code for token");

        // Get user details to store with the access token
        const userInfo = await this.getUserInfo(data.access_token);

        const IntegrationsEntity = Repository.getEntity("IntegrationsEntity");
        const StateEntity = Repository.getEntity("StateEntity");

        const state = await Repository.findOne(StateEntity, {
            state: stateCode
        });

        if(!state)
            throw new Error("State not found");

        const integration = await Repository.insert(IntegrationsEntity, {
            type: "instagram",
            account: state.account,
            accessToken: data.access_token,
            name: userInfo.username,
            pageId: userInfo.id,
            image: userInfo.profile_picture
        });

        await Repository.deleteMany(StateEntity, {
            state: stateCode
        });

        if(!integration)
            throw new Error("Integration not found");

        return `${process.env.FRONTEND_URL.replace("/api", "")}/social-accounts?success=true&message=Successfully connected to Instagram&platform=instagram`;
    }

    /**
     * Get user information
     * @param accessToken - The access token
     * @returns The user information
     */
    async getUserInfo(accessToken: string) {
        const url = new URL(`${this.graphUrl}/me`);
        url.searchParams.set("fields", "id,username,account_type,media_count");
        url.searchParams.set("access_token", accessToken);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error?.message || "Error getting user info");

        // Get the user's profile picture
        const profilePicture = await this.getUserProfilePicture(accessToken, data.id);

        return {
            ...data,
            profile_picture: profilePicture
        };
    }

    /**
     * Get user profile picture
     * @param accessToken - The access token
     * @param userId - The user ID
     * @returns The profile picture URL
     */
    async getUserProfilePicture(accessToken: string, userId: string) {
        try {
            // Instagram Graph API doesn't directly provide profile pictures,
            // so we need to fetch recent media and use the user's avatar from there
            // or fallback to a default image
            const url = new URL(`${this.graphUrl}/me/media`);
            url.searchParams.set("fields", "id,media_type,media_url,thumbnail_url");
            url.searchParams.set("limit", "1");
            url.searchParams.set("access_token", accessToken);

            const res = await fetch(url.toString());
            const data = await res.json();

            if (!res.ok || !data.data || data.data.length === 0) {
                return null; // No profile picture available
            }

            // Use the media URL or thumbnail_url from the most recent post
            const recentMedia = data.data[0];
            return recentMedia.thumbnail_url || recentMedia.media_url || null;
        } catch (error) {
            console.error("Error getting profile picture:", error);
            return null;
        }
    }

    /**
     * Get user media
     * @param accessToken - The access token
     * @returns The user media
     */
    async getUserMedia(accessToken: string) {
        const url = new URL(`${this.graphUrl}/me/media`);
        url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
        url.searchParams.set("access_token", accessToken);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error?.message || "Error getting user media");

        return data.data;
    }

    /**
     * Create a media post (not directly supported by Instagram API, requires Facebook Pages API)
     * @param accessToken - The access token
     * @param caption - The caption for the post
     * @param mediaUrl - The URL of the media to post
     * @returns The post result
     */
    async createMediaPost(accessToken: string, caption: string, mediaUrl: string) {
        // Note: Instagram Graph API doesn't support direct posting
        // Instagram content publishing requires Facebook Pages API with Instagram business account
        throw new Error("Direct posting to Instagram is not supported via the basic API. Requires a Facebook Page connected to an Instagram Professional account.");
    }
}
