import "./config";

import { Application, EventsService } from "@cmmv/core";
import { AuthModule } from "@cmmv/auth";
import { DefaultAdapter, DefaultHTTPModule } from "@cmmv/http";
import { RepositoryModule, Repository } from "@cmmv/repository";
import { AutopostModule } from "./modules/autopost.module";

Application.create({
    httpAdapter: DefaultAdapter,
    modules: [
        DefaultHTTPModule,
        RepositoryModule,
        AuthModule,
        AutopostModule
    ],
    providers: [
        Repository,
        EventsService
    ]
});
