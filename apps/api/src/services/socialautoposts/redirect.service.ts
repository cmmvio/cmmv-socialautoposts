import { Service } from '@cmmv/core';

import {
    RepositorySchema
} from "@cmmv/repository";

import {
    ShortLinksEntity
} from "@entities/socialautoposts/shortlinks.entity";

import {
    ShortLinks
} from "@models/socialautoposts/shortlinks.model";

@Service("redirect")
export class RedirectService {
    protected schema = new RepositorySchema(ShortLinksEntity, ShortLinks, false, true, false);

    /**
     * Get short link
     * @param id
     * @returns
     */
    async getShortLink(uuid: string) {
        const shortLink = await this.schema.getAll({
            uuid,
            limit: 1
        });

        if(!shortLink)
            throw new Error('Short link not found');

        return shortLink.data[0].originalLink;
    }
}