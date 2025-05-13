import {
    Controller, Get,
    Res, Query, User,
    Post, Body, Raw, ContentType
} from "@cmmv/http";

import {
    TwitterService
} from "../../services/integrations/twitter.service";

import {
    IntegrationsService
} from "../../services/socialautoposts/integrations.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('integration/twitter')
export class TwitterController {
    constructor(
        private readonly twitterService: TwitterService,
        private readonly integrationsService: IntegrationsService
    ) {}

    @Get('access')
    @Auth()
    async access(@Query('state') stateCode: string, @User() user: any, @Res() response: any) {
        const linkTwitter = this.twitterService.getAuthorizationUrl(stateCode);
        const redirectLink = await this.integrationsService.generateState(user.id, stateCode, linkTwitter);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('callback')
    async callback(@Query('state') state: string, @Query('code') code: string, @Res() response: any) {
        const redirectLink = await this.twitterService.exchangeCodeForToken(state, code);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('user-info')
    @Auth()
    async getUserInfo(@Query('accessToken') accessToken: string) {
        return await this.twitterService.getUserInfo(accessToken);
    }

    @Get('user-timeline')
    @Auth()
    async getUserTimeline(@Query('accessToken') accessToken: string, @Query('userId') userId: string) {
        return await this.twitterService.getUserTimeline(accessToken, userId);
    }

    @Post('post-tweet')
    @Auth()
    async postTweet(@Body() payload: { accessToken: string; text: string }) {
        return await this.twitterService.postTweet(payload.accessToken, payload.text);
    }
}
