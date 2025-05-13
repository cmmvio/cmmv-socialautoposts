import { Service } from '@cmmv/core';

import {
    RepositorySchema
} from "@cmmv/repository";

import {
   FeedsServiceGenerated
} from "@generated/services/socialautoposts/feeds.service";

import {
    FeedsEntity
} from "@entities/socialautoposts/feeds.entity";

import {
    Feeds
} from "@models/socialautoposts/feeds.model";

@Service("feeds")
export class FeedsService extends FeedsServiceGenerated {
    protected schema = new RepositorySchema(FeedsEntity, Feeds, false, true, false);

    /**
     * Get feeds
     * @param query
     * @param accountId
     * @returns
     */
    async getFeeds(query: any, accountId: string) {
        const feeds = await this.schema.getAll({
            ...query,
            account: accountId
        });

        return feeds;
    }

    /**
     * Create feed
     * @param feed
     * @returns
     */
    async createFeed(feed: any, accountId: string) {
        if(!feed.name || !feed.link)
            throw new Error('Name and link are required');

        const result = await this.schema.insert({
            ...feed,
            account: accountId
        });

        return result;
    }

    /**
     * Update feed
     * @param feed
     * @returns
     */
    async updateFeed(id: string, payload: any, accountId: string) {
        const feed = await this.schema.getById(id);

        if(!feed || feed.data.account !== accountId)
            throw new Error('Feed not found');

        if(!payload.name || !payload.link)
            throw new Error('Name and link are required');

        const result = await this.schema.update(id, {
            ...payload,
            account: accountId
        });

        return result;
    }

    /**
     * Delete feed
     * @param id
     * @returns
     */
    async deleteFeed(id: string, accountId: string) {
        const feed = await this.schema.getById(id);

        if(!feed || feed.data.account !== accountId)
            throw new Error('Feed not found');

        return await this.schema.delete(id);
    }
}