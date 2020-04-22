import * as cdk from '@aws-cdk/core';
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import { ServiceStack } from './service-stack';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    //todo: These should be coming in as config variables then use CDK Synth to generate the boiler plate
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
