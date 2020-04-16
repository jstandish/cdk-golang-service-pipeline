import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import { Repository } from './components/repository';
import { BuildContainer } from './components/build';
import { ECS } from './components/ecs';
import { Pipeline } from './components/pipeline';
import { Cluster, ICluster } from '@aws-cdk/aws-ecs';
import { ServiceStack } from './service-stack';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const environments = ["dev", "master"];
    const services = ["my-first-service"];

    services.forEach(service => {
      new ServiceStack(this, `${service}`, {
        environments: environments,
        serviceName: service
      })
    });
  }
}
