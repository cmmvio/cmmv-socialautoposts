import { Service } from '@cmmv/core';

import {
    RepositorySchema
} from "@cmmv/repository";

import {
   ShortLinksServiceGenerated
} from "@generated/services/socialautoposts/shortlinks.service";

import {
    ShortLinksEntity
} from "@entities/socialautoposts/shortlinks.entity";

import {
    ShortLinks
} from "@models/socialautoposts/shortlinks.model";

@Service("shortlinks")
export class ShortLinksService extends ShortLinksServiceGenerated {
    protected schema = new RepositorySchema(
        ShortLinksEntity,
        ShortLinks,
        false,
        true,
        false
    );

    /**
     * Get short links
     * @param queries
     * @param accountId
     * @returns
     */
    async getShortLinks(queries: any, accountId: string) {
        return await this.schema.getAll(queries, {
            ...queries,
            account: accountId
        });
    }

    /**
     * Generate a random 8-character UUID using only letters (uppercase and lowercase)
     */
    private generateUuid(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';

        for (let i = 0; i < 8; i++)
            result += characters.charAt(Math.floor(Math.random() * characters.length));

        return result;
    }

    /**
     * Check if a UUID already exists in the database
     * @param uuid The UUID to check
     */
    private async uuidExists(uuid: string): Promise<boolean> {
        const result = await this.schema.getAll({ uuid }, {
            limit: 1
        });

        return result.count > 0;
    }

    /**
     * Generate a unique UUID that doesn't exist in the database
     */
    private async generateUniqueUuid(): Promise<string> {
        const maxAttempts = 10;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const uuid = this.generateUuid();
            const exists = await this.uuidExists(uuid);

            if (!exists)
                return uuid;

            attempts++;
        }

        throw new Error('Failed to generate a unique UUID after multiple attempts');
    }

    /**
     * Create short link
     * @param originalLink
     * @param accountId
     * @returns
     */
    async createShortLink(payload: { originalUrl: string, shortUrl: string }, accountId: string ) {
        const uuid = await this.generateUniqueUuid();

        return await this.schema.insert({
            uuid,
            originalLink: payload.originalUrl,
            shortUrl: `https://${payload.shortUrl}${uuid}`,
            account: accountId
        });
    }

    /**
     * Get short link
     * @param id
     * @returns
     */
    async getShortLink(id: string) {
        const shortLink = await this.schema.getById(id);

        if(!shortLink)
            throw new Error('Short link not found');

        return shortLink.data.originalLink;
    }
}