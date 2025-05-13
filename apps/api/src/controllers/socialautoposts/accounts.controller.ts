import {
    Controller, Post,
    Body, ContentType,
    Raw, Header, Get, User
} from "@cmmv/http";

import {
    AccountsControllerGenerated
} from "@generated/controllers/socialautoposts/accounts.controller";

import {
    AccountsService
} from "@services/socialautoposts/accounts.service";

import {
    Auth
} from "../../decorators/auth.decorator";

@Controller('accounts')
export class AccountsController extends AccountsControllerGenerated {
    constructor(
        private readonly accountsService: AccountsService
    ){
        super(accountsService);
    }

    @Post('login/firebase')
    @ContentType('text/plain')
    @Raw()
    async loginWithFirebase(@Body() body: any) {
        return this.accountsService.firebaseLogin(body);
    }

    @Get('check')
    @Auth()
    async checkSession(@Header('Authorization') token: string) {
        return this.accountsService.checkSession(token.split(' ')[1]);
    }

    @Get('profile')
    @Auth()
    async getProfile(@Header('Authorization') token: string, @User() user: any) {
        return this.accountsService.getProfile(token.split(' ')[1]);
    }
}