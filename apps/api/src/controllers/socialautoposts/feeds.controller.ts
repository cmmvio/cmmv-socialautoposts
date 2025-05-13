import {
    Controller, Get,
    Queries, User, Post,
    Body, Put, Param,
    Delete
} from "@cmmv/http";

import {
    FeedsControllerGenerated
} from "@generated/controllers/socialautoposts/feeds.controller";

import {
    Auth
} from "../../decorators/auth.decorator";

import {
    FeedsService
} from "@services/socialautoposts/feeds.service";

@Controller('feeds')
export class FeedsController extends FeedsControllerGenerated {
    constructor(
        private readonly feedsService: FeedsService
    ) { super(feedsService); }

    @Get()
    @Auth()
    async getFeeds(@Queries() query: any, @User() user: any) {
        return this.feedsService.getFeeds(query, user.id);
    }

    @Post()
    @Auth()
    async createFeed(@Body() feed: any, @User() user: any) {
        return this.feedsService.createFeed(feed, user.id);
    }

    @Put(':id')
    @Auth()
    async updateFeed(@Param('id') id: string, @Body() feed: any, @User() user: any) {
        return this.feedsService.updateFeed(id, feed, user.id);
    }

    @Delete(':id')
    @Auth()
    async deleteFeed(@Param('id') id: string, @User() user: any) {
        return this.feedsService.deleteFeed(id, user.id);
    }
}