import { Service } from '@cmmv/core';
import { Repository } from '@cmmv/repository';

@Service("twitter")
export class TwitterService {
    protected apiUrl = "https://api.twitter.com";
    protected authUrl = "https://x.com/i/oauth2/authorize";
    protected tokenUrl = "https://api.x.com/2/oauth2/token";

    /**
     * Get authorization URL (PKCE OAuth2.0)
     */
    getAuthorizationUrl(state: string, codeChallenge: string): string {
        const url = new URL(this.authUrl);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", process.env.TWITTER_CLIENT_ID || "");
        url.searchParams.set("redirect_uri", `${process.env.FRONTEND_URL}/integration/twitter/callback`);
        url.searchParams.set("scope", [
            "tweet.read",
            "tweet.write",
            "users.read",
            "offline.access"
        ].join(" "));
        url.searchParams.set("state", state);
        url.searchParams.set("code_challenge", codeChallenge);
        url.searchParams.set("code_challenge_method", "plain"); // ou 'S256' se estiver usando hash real

        return url.toString();
    }

    /**
     * Exchange code for access token
     */
    async exchangeCodeForToken(stateCode: string, code: string, codeVerifier: string) {
        const formData = new URLSearchParams();
        formData.append("client_id", process.env.TWITTER_CLIENT_ID || "");
        formData.append("grant_type", "authorization_code");
        formData.append("code", code);
        formData.append("redirect_uri", `${process.env.FRONTEND_URL}/integration/twitter/callback`);
        formData.append("code_verifier", codeVerifier);

        const res = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok)
            throw new Error(data.error_description || "Error exchanging code for token");

        const userInfo = await this.getUserInfo(data.access_token);

        const IntegrationsEntity = Repository.getEntity("IntegrationsEntity");
        const StateEntity = Repository.getEntity("StateEntity");

        const state = await Repository.findOne(StateEntity, { state: stateCode });

        if (!state)
            throw new Error("State not found");

        const integration = await Repository.insert(IntegrationsEntity, {
            type: "twitter",
            account: state.account,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            name: userInfo.username,
            pageId: userInfo.id,
            image: userInfo.profile_image_url
        });

        await Repository.deleteMany(StateEntity, { state: stateCode });

        if (!integration)
            throw new Error("Integration not saved");

        return `${process.env.FRONTEND_URL.replace("/api", "")}/social-accounts?success=true&message=Connected to Twitter/X&platform=x`;
    }

    /**
     * Get user info
     */
    async getUserInfo(accessToken: string) {
        const url = new URL(`${this.apiUrl}/2/users/me`);
        url.searchParams.set("user.fields", "id,name,username,profile_image_url");

        const res = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await res.json();

        if (!res.ok)
            throw new Error(data.errors?.[0]?.message || "Error getting user info");

        return data.data;
    }

    /**
     * Post tweet
     */
    async postTweet(accessToken: string, text: string) {
        const res = await fetch(`${this.apiUrl}/2/tweets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (!res.ok)
            throw new Error(data.errors?.[0]?.message || "Error posting tweet");

        return data.data;
    }

    /**
     * Get user timeline
     */
    async getUserTimeline(accessToken: string, userId: string) {
        const url = new URL(`${this.apiUrl}/2/users/${userId}/tweets`);
        url.searchParams.set("max_results", "10");
        url.searchParams.set("tweet.fields", "created_at,text,public_metrics");

        const res = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const data = await res.json();

        if (!res.ok)
            throw new Error(data.errors?.[0]?.message || "Error getting timeline");

        return data.data;
    }
}
