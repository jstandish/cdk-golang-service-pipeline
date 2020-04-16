import { Construct } from "@aws-cdk/core";
import cc = require('@aws-cdk/aws-codecommit');

export class Repository extends Construct {
    Repositroy : cc.IRepository;

    constructor(parent: Construct, name: string) {
        super(parent, name);

        this.Repositroy = new cc.Repository(parent, "repo", {
            repositoryName: `${name}`,
        });
    }
}