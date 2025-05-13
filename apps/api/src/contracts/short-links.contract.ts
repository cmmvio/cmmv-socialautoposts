import {
    Contract, AbstractContract,
    ContractField
} from "@cmmv/core";

import {
    AccountsContract
} from "./accounts.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'ShortLinks',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_short_links",
        databaseTimestamps: true
    }
})
export class ShortLinksContract extends AbstractContract {
    @ContractField({
        protoType: "string",
        objectType: "object",
        entityType: "AccountsEntity",
        nullable: false,
        index: true,
        readOnly: true,
        link: [
            {
                createRelationship: true,
                contract: AccountsContract,
                contractName: 'AccountsContract',
                entityName: 'account',
                field: 'id',
            }
        ]
    })
    account!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
        readOnly: true
    })
    uuid!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    originalLink!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    shortUrl!: string;
}
