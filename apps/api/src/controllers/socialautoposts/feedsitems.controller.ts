import {
    Controller, Queries,
    User, Get
} from "@cmmv/http";

import {
    FeedsItemsControllerGenerated
} from "@generated/controllers/socialautoposts/feedsitems.controller";

import {
    FeedsItemsService
} from "@services/socialautoposts/feedsitems.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('queue')
export class FeedsItemsController extends FeedsItemsControllerGenerated {
    constructor(
        private readonly feedsItemsService: FeedsItemsService
    ) { super(feedsItemsService); }

    @Get()
    @Auth()
    async getFeedsItems(@Queries() queries: any, @User() user: any) {
        return this.feedsItemsService.getFeedsItems(queries, user.id);
    }
}