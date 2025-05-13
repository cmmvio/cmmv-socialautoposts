import {
    Controller, Get,
    Res, Query, User,
    Post, Body, Raw, ContentType
} from "@cmmv/http";

import {
    FacebookService
} from "../../services/integrations/facebook.service";

import {
    IntegrationsService
} from "../../services/socialautoposts/integrations.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('integration/facebook')
export class FacebookController {
    constructor(
        private readonly facebookService: FacebookService,
        private readonly integrationsService: IntegrationsService
    ) {}


    @Get('access')
    @Auth()
    async access(@Query('state') stateCode: string, @User() user: any, @Res() response: any) {
        const linkFacebook = this.facebookService.getAuthorizationUrl(stateCode);
        const redirectLink = await this.integrationsService.generateState(user.id, stateCode, linkFacebook);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('callback')
    async callback(@Query('state') state: string, @Query('code') code: string, @Res() response: any) {
        const redirectLink = await this.facebookService.exchangeCodeForToken(state, code);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('list-pages')
    @Auth()
    async listPages(
        @Query('state') state: string,
        @Query('uuid') uuid: string,
        @Query('accessToken') accessToken: string
    ) {
        return await this.facebookService.listPages(accessToken);
    }

    @Post('save-page')
    @Auth()
    async savePage(@Body() payload: any, @User() user: any) {
        return await this.facebookService.savePage(payload, user.id);
    }

    @Get('get-page-image')
    @Auth()
    @ContentType('text/plain')
    @Raw()
    async getPageImage(@Query('pageId') pageId: string, @Query('accessToken') accessToken: string) {
        return await this.facebookService.getPageImage(pageId, accessToken);
    }
}