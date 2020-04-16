import { Construct } from "@aws-cdk/core";
import iam = require('@aws-cdk/aws-iam');
import ecs = require('@aws-cdk/aws-ecs');
import cc = require('@aws-cdk/aws-codecommit');
import cb = require('@aws-cdk/aws-codebuild');
import cp = require('@aws-cdk/aws-codepipeline');
import cpa = require('@aws-cdk/aws-codepipeline-actions');
import * as cloudformation from '@aws-cdk/aws-cloudformation';

export class Pipeline extends Construct {
    constructor(parent: Construct, name: string, config: { 
            sourcerepo: cc.IRepository, 
            branch: string, 
            build: cb.IProject
        }) {
        super(parent, name);


        const sourceOutput = new cp.Artifact();
        const sourceAction = new cpa.CodeCommitSourceAction({
            actionName: 'CodeCommit',
            repository: config.sourcerepo,
            branch: config.branch,
            output: sourceOutput
        });


        const pipeline = new cp.Pipeline(parent, `${name}-codepipeline-${config.branch}`, {
            pipelineName: `${name}`
        });

        pipeline.addStage({
            stageName: "Source",
            actions: [sourceAction]
        });

        const cdkBuildOutput = new cp.Artifact('CdkBuildOutput');
        pipeline.addStage({
            stageName: "Build",
            actions : [new cpa.CodeBuildAction({
                input: sourceOutput,
                actionName: "Execute",
                type: cpa.CodeBuildActionType.BUILD,
                project: config.build,
                outputs: [
                    cdkBuildOutput
                ]
            })]
        });   
        

        // Deployment Role
        const depRole = new iam.Role(this, `${name}-${config.branch}-deprole`, {
            roleName: `${name}-${config.branch}-deprole`,
            assumedBy: new iam.ArnPrincipal(pipeline.role.roleArn)
        });

        depRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                "apigateway:*",
                "codedeploy:*",
                "lambda:*",
                "cloudformation:CreateChangeSet",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:PutRolePolicy",
                "iam:AttachRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PassRole",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetBucketVersioning"
            ],
            resources: [
                "*"
            ]
        }))

        pipeline.addStage({
            stageName: "Deploy",
            actions : [new cpa.CloudFormationCreateReplaceChangeSetAction({
                actionName: "Deploy",
                adminPermissions: true,
                stackName: `${name}`,
                changeSetName: `${name}-changeset`,
                templatePath: cdkBuildOutput.atPath("outputtemplate.yml"),
                capabilities: [
                    cloudformation.CloudFormationCapabilities.AUTO_EXPAND,
                    cloudformation.CloudFormationCapabilities.NAMED_IAM,
                    cloudformation.CloudFormationCapabilities.ANONYMOUS_IAM
                ],
                role: depRole,
            })]
        });
    }
}