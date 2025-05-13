import {
    Controller, Post, Body,
    User, Get, Queries
} from "@cmmv/http";

import {
    ShortLinksControllerGenerated
} from "@generated/controllers/socialautoposts/shortlinks.controller";

import {
    ShortLinksService
} from "../../services/socialautoposts/shortlinks.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('shortlinks')
export class ShortLinksController extends ShortLinksControllerGenerated {
    constructor(
        private readonly shortLinksService: ShortLinksService
    ) { super(shortLinksService); }

    @Get()
    @Auth()
    async getShortLinks(@Queries() queries: any, @User() user: any) {
        return this.shortLinksService.getShortLinks(queries, user.id);
    }

    @Post()
    @Auth()
    async createShortLink(@Body() payload: any, @User() user: any) {
        return this.shortLinksService.createShortLink(payload, user.id);
    }
}