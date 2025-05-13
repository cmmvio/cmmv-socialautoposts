import {
    Contract, AbstractContract,
    ContractField
} from "@cmmv/core";

import { AccountsContract } from "./accounts.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'Api',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    generateController: false,
    generateBoilerplates: false,
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_api",
        databaseTimestamps: true
    }
})
export class ApiContract extends AbstractContract {
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
            },
        ],
    })
    account!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    token!: string;

    @ContractField({
        protoType: "boolean",
        nullable: false,
        index: true,
        defaultValue: false,
    })
    revoke!: boolean;
}
