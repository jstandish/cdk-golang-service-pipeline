## Use at your own risk! You are responsible for where and how this is deployed. I assume no responsiblity.

# Golang Lambda Build Pipeline using CDK

The purpose of this is to create a service pipeline using AWS Lambda. We are using `ginkgo` for testing, and `AWS SAM` to create the changeset for deployment.

## Services Used
- AWS CodeCommit
- AWS CodeBuild
- AWS CodeDeploy (SAM Canary Deployments)
- AWS CodePipeline
- AWS Lambda
- AWS API Gateway