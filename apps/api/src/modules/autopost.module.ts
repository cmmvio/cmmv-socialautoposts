import { Module } from '@cmmv/core';

import {
    AccountsContract,
    FeedsContract,
    FeedItemContract,
    ShortLinksContract,
    ApiContract,
    IntegrationsContract,
    StateContract
} from '../contracts';

import {
    RedirectController
} from '../controllers/socialautoposts/redirect.controller';

import {
    RedirectService
} from '../services/socialautoposts/redirect.service';

import {
    IntegrationsModule
} from './integrations.module';

export const AutopostModule = new Module('socialautoposts', {
    contracts: [
        AccountsContract,
        FeedsContract,
        FeedItemContract,
        ShortLinksContract,
        ApiContract,
        IntegrationsContract,
        StateContract
    ],
    controllers: [RedirectController],
    providers: [RedirectService],
    submodules: [IntegrationsModule]
});
