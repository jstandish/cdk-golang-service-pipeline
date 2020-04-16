import * as cdk from '@aws-cdk/core';
import * as cf from '@aws-cdk/aws-cloudformation';
import { Repository } from './components/repository';
import { BuildContainer } from './components/build';
import { Pipeline } from './components/pipeline';

export class ServiceStack extends cf.NestedStack {
    constructor(scope: cdk.Construct, id: string, props: {
        environments: string[],
        serviceName: string
    }) {
        super(scope, id);

        const sourceRepository = new Repository(this, `${props.serviceName}-repo`);
        // Create the CodeBuild project


        props.environments.forEach(env => {

            // Create the CodeBuild project
            const build = new BuildContainer(this, `${props.serviceName}-${env}-build`, {
                repo: sourceRepository.Repositroy,
                branch: env
            });

            // Create the CodePipeline
            const pipeline = new Pipeline(this, `${props.serviceName}-${env}-pipeline`, {
                branch: env,
                build: build.Project,
                sourcerepo: sourceRepository.Repositroy,
            });
        });
    }
}

