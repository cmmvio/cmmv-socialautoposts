import * as xml2js from 'xml2js';

import {
    Service, Cron, CronExpression
} from '@cmmv/core';

import {
    Repository,
    RepositorySchema
} from "@cmmv/repository";

import {
   FeedsItemsServiceGenerated
} from "@generated/services/socialautoposts/feedsitems.service";

import { FeedsEntity } from "@entities/socialautoposts/feeds.entity";
import { FeedsItemsEntity } from "@entities/socialautoposts/feedsitems.entity";

import { Feeds } from "@models/socialautoposts/feeds.model";
import { FeedsItems } from "@models/socialautoposts/feedsitems.model";

interface RssItem {
    link: string;
    title: string;
    content?: string;
    'media:content'?: { $?: { url?: string }, url?: string };
    enclosure?: { $?: { url?: string }, url?: string };
    pubDate?: string;
    category?: string | string[];
    'content:encoded'?: string;
}

interface RssFeed {
    rss?: {
        channel?: {
            item?: RssItem | RssItem[];
        }
    }
}

@Service("feedsitems")
export class FeedsItemsService extends FeedsItemsServiceGenerated {
    protected schemaFeeds = new RepositorySchema(FeedsEntity, Feeds, false, true, false);
    protected schema = new RepositorySchema(FeedsItemsEntity, FeedsItems, false, true, false);

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleFeedsItems() {
        const FeedsEntity = Repository.getEntity("FeedsEntity");
        const feeds = await Repository.findAll(FeedsEntity, {
            limit: 100000
        }, [], {
            select: ["id", "link", "account"]
        });

        for (const feed of feeds.data) {
            const feedData = await this.processFeed.call(this, feed.link);

            if (!feedData)
                continue;

            await this.processFeedItem(feedData, feed.id, feed.account);
        }
    }

    /**
     * Process the feed
     * @param feedUrl - The URL of the feed
     * @returns The feed data
     */
    async processFeed(feedUrl: string) {
        const response = await fetch(feedUrl, { method:"GET" });

        if (!response.ok)
            return;

        const xml = await response.text();

        const parser = new xml2js.Parser({
            explicitArray: false,
            normalize: true,
            normalizeTags: false,
            mergeAttrs: false,
            attrkey: '$'
        });

        return new Promise<RssFeed>((resolve, reject) => {
            parser.parseString(xml, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result as RssFeed);
                }
            });
        });
    }

    /**
     * Process the feed for a specific channel
     * @param feedData - The feed data
     * @param feedId - The ID of the feed to process
     * @returns The result of the processing
     */
    async processFeedItem(feedData: any, feedId: string, accountId: string) {
        try {
            let items = [];
            let feedType = '';

            if (feedData.rss && feedData.rss.channel) {
                const feedItems = feedData.rss.channel.item;
                feedType = 'RSS';

                if (!feedItems)
                    return;

                items = Array.isArray(feedItems) ? feedItems : [feedItems];
            }
            else if (feedData.feed && feedData.feed.entry) {
                const feedEntries = feedData.feed.entry;
                feedType = 'Atom';

                if (!feedEntries)
                    return;

                items = Array.isArray(feedEntries) ? feedEntries : [feedEntries];
            } else {
                return;
            }

            const MAX_ITEMS = 10;

            if (items.length > MAX_ITEMS)
                items = items.slice(0, MAX_ITEMS);

            let itemsAdded = 0;
            let processedCount = 0;

            for (const item of items) {
                processedCount++;

                try {
                    const itemPromise = this.processFeedItemSafely(item, feedType, feedId, accountId);

                    const result = await Promise.race([
                        itemPromise,
                        new Promise((_, reject) => {
                            setTimeout(() => reject(), 15000);
                        })
                    ]) as { success: boolean, message?: string };

                    if (result && result.success)
                        itemsAdded++;
                } catch (itemError) {}

                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            return itemsAdded;
        } catch (error) {}
    }

    /**
     * Process the feed item safely
     * @param item - The item to process
     * @param feedType - The type of feed
     * @param feedId - The ID of the feed
     * @param accountId - The ID of the account
     * @returns The result of the processing
     */
    private async processFeedItemSafely(
        item: any,
        feedType: string,
        feedId: string,
        accountId: string
    ): Promise<{ success: boolean, message?: string }> {

        try {
            const FeedsItemsEntity = Repository.getEntity("FeedsItemsEntity");

            let link = '';
            let title = '';
            let content = '';
            let featureImage = '';
            let pubDate = new Date();

            if (feedType === 'RSS') {
                link = item.link;
                title = item.title;

                if (item['content:encoded'])
                    content = item['content:encoded'];
                else if (item.content)
                    content = item.content;
                else if (item.description)
                    content = item.description;
                else
                    content = item.content || '';

                if (item['media:content'] && item['media:content'].$?.url)
                    featureImage = item['media:content'].$.url;
                else if (item['media:content'] && item['media:content'].url)
                    featureImage = item['media:content'].url;
                else if (item.enclosure && item.enclosure.$?.url)
                    featureImage = item.enclosure.$.url;
                else if (item.enclosure && item.enclosure.url)
                    featureImage = item.enclosure.url;

                if (item.pubDate)
                    pubDate = new Date(item.pubDate);
            } else {
                if (Array.isArray(item.link)) {
                    const alternateLink = item.link.find((l: any) => l.$ && l.$.rel === 'alternate');
                    link = alternateLink ? alternateLink.$.href : (item.link[0].$ ? item.link[0].$.href : '');
                } else if (item.link && item.link.$) {
                    link = item.link.$.href;
                }

                if (typeof item.title === 'string')
                    title = item.title;
                else if (item.title) {
                    title = item.title._ || (item.title.$ && item.title.$._) || '';

                    if (title.startsWith('<![CDATA[') && title.endsWith(']]>'))
                        title = title.substring(9, title.length - 3).trim();
                }

                if (item.content)
                    content = typeof item.content === 'string' ? item.content : (item.content._ || '');
                else if (item.summary)
                    content = typeof item.summary === 'string' ? item.summary : (item.summary._ || '');

                if (content.startsWith('<![CDATA[') && content.endsWith(']]>'))
                    content = content.substring(9, content.length - 3).trim();

                if (item['media:content'] && item['media:content'].$?.url)
                    featureImage = item['media:content'].$.url;

                if (item.published)
                    pubDate = new Date(item.published);
                else if (item.updated)
                    pubDate = new Date(item.updated);
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (pubDate < sevenDaysAgo)
                return;

            if (!link)
                return;

            const existingItem = await Repository.findOne(FeedsItemsEntity, {
                link: link
            });

            if (existingItem)
                return;

            const newItem = {
                title,
                description: content,
                image: featureImage,
                link,
                pubDate,
                feed: feedId,
                account: accountId,
                processed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await Repository.insert(FeedsItemsEntity, newItem);

            return;
        } catch (error) {}
    }

    /**
     * Get the feeds items
     * @param queries - The queries
     * @param accountId - The ID of the account
     * @returns The feeds items
     */
    async getFeedsItems(queries: any, accountId: string) {
        return await this.schema.getAll({
            account: accountId,
            offset: queries.offset || 0,
            limit: queries.limit || 10,
            processed: (queries.processed === 'true') ? true : false,
        });
    }
}