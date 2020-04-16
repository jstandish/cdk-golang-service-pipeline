import { Construct, Aws } from "@aws-cdk/core";
import cb = require('@aws-cdk/aws-codebuild');
import cc = require('@aws-cdk/aws-codecommit');
import ecr = require('@aws-cdk/aws-ecr');
import s3 = require('@aws-cdk/aws-s3');
import iam = require("@aws-cdk/aws-iam");
import { PolicyDocument } from "@aws-cdk/aws-iam";

export class BuildContainer extends Construct {
  Project: cb.IProject;

  constructor(parent: Construct, name: string, config: { repo: cc.IRepository, branch: string }) {
    super(parent, name);

    const projectName = `${name}`;

    const s3ArtifactBucket = new s3.Bucket(this, `${projectName}-artifacts`, {
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    this.Project = new cb.Project(parent, `${projectName}-proj`, {
      source: cb.Source.codeCommit({
        repository: config.repo,
        branchOrRef: config.branch
      }),
      environment: {
        privileged: true,
        buildImage: cb.LinuxBuildImage.STANDARD_3_0
      },
      cache: cb.Cache.local(cb.LocalCacheMode.DOCKER_LAYER, cb.LocalCacheMode.CUSTOM),
      projectName: projectName,
      buildSpec: cb.BuildSpec.fromObject(
        {
          "version": 0.2,
          "phases": {
            "install": {
              "runtime-versions": {
                "golang": 1.13,
              }
            },
            "build": {
              "commands": [
                "echo Build started on `date`",
                "git config --global credential.helper '!aws codecommit credential-helper $@'",
                "git config --global credential.UseHttpPath true",
                "cd src",
                `GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" main.go`, //build outside the container then copy in the main file
                "go test ./...",
              ]
            },
            "post_build": {
              "commands": [
                "echo Build completed on `date`",
                "echo Pushing the Lambda...",
                "aws cloudformation package --template-file template.yml --s3-bucket $S3_ARTIFACT_BUCKET --output-template-file outputtemplate.yml"
              ]
            }
          },
          "reports": {
            "allreports": {
              "files": [
                "**/*"
              ],
              "base-directory": "src",
              "discard-paths": "no"
            }
          },
          "artifacts": {
            "type": "zip",
            "files": [
              "template.yml",
              "outputtemplate.yml"
            ]
          },
          "cache": {
            "paths": [
              "$GOPATH/pkg/mod/**/*"
            ]
          }
        }
      ),
      role: this.createCodeBuildRole(projectName, name, config.repo),
      environmentVariables: {
        "AWS_ACCOUNT_ID": {
          value: Aws.ACCOUNT_ID,
          type: cb.BuildEnvironmentVariableType.PLAINTEXT,
        },
        "S3_ARTIFACT_BUCKET": {
          value: s3ArtifactBucket.bucketArn,
          type: cb.BuildEnvironmentVariableType.PLAINTEXT
        },
        "IMAGE_TAG": {
          value: "latest",
          type: cb.BuildEnvironmentVariableType.PLAINTEXT
        }
      }
    });
  }

  createCodeBuildRole(projectName: string, name: string, repo: cc.IRepository): iam.IRole {
    const role = new iam.Role(this, `${name}-code-build-role`, {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      roleName: `CodeBuild${name}`
    });

    role.addToPolicy(new iam.PolicyStatement({
      actions: ["codecommit:GitPull",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "codebuild:CreateReportGroup",
        "codebuild:CreateReport",
        "codebuild:UpdateReport",
        "codebuild:BatchPutTestCases",
        "s3:PutObject",
        "s3:GetObject",
        "s3:GetBucketLocation",
        "s3:GetObjectVersion",
        "s3:GetBucketAcl"

      ],
      resources: [
        `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/codebuild/${projectName}`,
        `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/codebuild/${projectName}:*`,
        `arn:aws:codebuild:${Aws.REGION}:${Aws.ACCOUNT_ID}:report-group/${projectName}-*`,
        `arn:aws:s3:::codepipeline-${Aws.REGION}-*`,
        repo.repositoryArn
      ]
    }));

    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetAuthorizationToken"
      ],
      resources: ["*"]
    }))

    return role
  }
}