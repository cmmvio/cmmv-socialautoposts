import {
    Contract, AbstractContract,
    ContractField
} from "@cmmv/core";

import {
    AccountsContract
} from "./accounts.contract";

@Contract({
    namespace: 'SocialAutoPosts',
    controllerName: 'State',
    protoPackage: 'socialautoposts',
    subPath: '/socialautoposts',
    auth: true,
    options: {
        moduleContract: true,
        databaseSchemaName: "socialautoposts_state",
        databaseTimestamps: true
    }
})
export class StateContract extends AbstractContract {
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
    })
    uuid!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    state!: string;

    @ContractField({
        protoType: "string",
        nullable: false,
        index: true,
    })
    link!: string;
}
