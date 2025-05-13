import {
    Controller, Get,
    Res, Query, User,
    Post, Body, Raw, ContentType
} from "@cmmv/http";

import {
    InstagramService
} from "../../services/integrations/instagram.service";

import {
    IntegrationsService
} from "../../services/socialautoposts/integrations.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('integration/instagram')
export class InstagramController {
    constructor(
        private readonly instagramService: InstagramService,
        private readonly integrationsService: IntegrationsService
    ) {}

    @Get('access')
    @Auth()
    async access(@Query('state') stateCode: string, @User() user: any, @Res() response: any) {
        const linkInstagram = this.instagramService.getAuthorizationUrl(stateCode);
        const redirectLink = await this.integrationsService.generateState(user.id, stateCode, linkInstagram);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('callback')
    async callback(@Query('state') state: string, @Query('code') code: string, @Res() response: any) {
        const redirectLink = await this.instagramService.exchangeCodeForToken(state, code);

        response.res.writeHead(302, {
            'Location': redirectLink
        }).end();
    }

    @Get('user-info')
    @Auth()
    async getUserInfo(@Query('accessToken') accessToken: string) {
        return await this.instagramService.getUserInfo(accessToken);
    }

    @Get('user-media')
    @Auth()
    async getUserMedia(@Query('accessToken') accessToken: string) {
        return await this.instagramService.getUserMedia(accessToken);
    }

    @Get('profile-picture')
    @Auth()
    @ContentType('text/plain')
    @Raw()
    async getProfilePicture(@Query('userId') userId: string, @Query('accessToken') accessToken: string) {
        return await this.instagramService.getUserProfilePicture(accessToken, userId);
    }
}
