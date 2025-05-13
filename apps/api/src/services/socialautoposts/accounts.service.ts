import * as crypto from 'node:crypto';
import * as jwt from 'jsonwebtoken';

import {
    Service, Config
} from '@cmmv/core';

import {
   AccountsServiceGenerated
} from "@generated/services/socialautoposts/accounts.service";

import {
    AbstractRepositoryService,
    RepositorySchema
} from "@cmmv/repository";

import {
    AccountsEntity
} from "@entities/socialautoposts/accounts.entity";

import {
    Accounts
} from "@models/socialautoposts/accounts.model";

import {
    AuthAutorizationService
} from "@cmmv/auth";

interface FirebaseLoginResult {
    token: string;
    provider: string;
    user: FirebaseProviderProfile;
}

interface FirebaseProviderProfile {
    accessToken?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    providerId?: string;
    uid?: string;
}

@Service("accounts")
export class AccountsService extends AccountsServiceGenerated {
    constructor(
        private readonly authAutorizationService: AuthAutorizationService
    ){
        super();
    }

    protected schema = new RepositorySchema(
        AccountsEntity,
        Accounts,
        false,
        true,
        false
    );

    /**
     * Login with Firebase
     * @param payload
     * @returns
     */
    async firebaseLogin(payload: FirebaseLoginResult){
        const jwtSecret = Config.get('auth.jwtSecret', "secret");
        const { token, provider, user } = payload;

        let account = await this.schema.getAll({
            provider: provider,
            providerUserId: user.uid
        });

        if(!account || account.count <= 0){
            const resultInsert = await this.schema.insert({
                name: user.displayName,
                email: user.email,
                username: crypto.createHash('sha1').update(user.email).digest('hex'),
                password: crypto.randomBytes(32).toString('hex'),
                avatar: user.photoURL,
                provider: provider,
                providerUserId: user.uid,
                profile: JSON.stringify(user),
                token: token
            });

            account = await this.schema.getAll({
                provider: provider,
                providerUserId: user.uid
            });
        }

        const tokenAuth = await this.createAuthToken(account.data[0], jwtSecret);
        return tokenAuth;
    }

    /**
     * Check session
     * @param token
     * @returns
     */
    async checkSession(token: any){
        const jwtSecret = Config.get('auth.jwtSecret', "secret");

        const decoded = jwt.verify(token, jwtSecret);

        const account = await this.schema.getAll({
            id: decoded.id
        });

        if(!account || account.count <= 0)
            throw new Error('Account not found');

        return { success: true };
    }

    /**
     * Get profile
     * @param token
     * @returns
     */
    async getProfile(token: any){
        const jwtSecret = Config.get('auth.jwtSecret', "secret");

        const decoded = jwt.verify(token, jwtSecret);

        const account = await this.schema.getAll({
            id: decoded.id
        });

        if(!account || account.count <= 0)
            throw new Error('Account not found');

        return account.data[0];
    }

    /**
     * Create a JWT token for the user
     * @param user
     * @param jwtSecret
     * @returns
     */
    private createAuthToken(
        user: any,
        jwtSecret: string
    ) {
        const accessToken = jwt.sign(
            { id: user.id },
            jwtSecret,
            { expiresIn: '1d' },
        );

        return accessToken;
    }
}