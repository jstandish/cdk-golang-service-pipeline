import { Construct, Aws } from "@aws-cdk/core";
import elbv2 = require('@aws-cdk/aws-elasticloadbalancingv2');
import ecr = require('@aws-cdk/aws-ecr');
import ep = require('@aws-cdk/aws-ecs-patterns');
import ecs = require('@aws-cdk/aws-ecs');
import ec2 = require('@aws-cdk/aws-ec2');

export class ECS extends Construct {
  ECRRepo: ecr.IRepository;
  Service: ep.ApplicationLoadBalancedFargateService;

  constructor(parent: Construct, name: string, props : {
    cluster: ecs.ICluster,
    loadBalancer: elbv2.IApplicationLoadBalancer,
  }) {
    super(parent, name);

    const projectName = `${name}`;

    // Create ECR Repository
    this.ECRRepo = new ecr.Repository(parent, `${projectName}-ecr`, {
      repositoryName: projectName.toLowerCase(),
      lifecycleRules : [
        {
          maxImageCount: 3
        }
      ]
    });

    const taskDef = new ecs.FargateTaskDefinition(this, `${projectName}-task-def`, {

    });

    taskDef.addContainer(`${projectName}-container`, {
      image : ecs.RepositoryImage.fromEcrRepository(this.ECRRepo),
      essential: true,
    }).addPortMappings({
      containerPort: 80,
      hostPort: 80
    });

    

    
    this.Service = new ep.ApplicationLoadBalancedFargateService(this, `${projectName}-service`, {
      loadBalancer: props.loadBalancer,
      cluster: props.cluster,
      listenerPort: 80,
      serviceName: projectName.toLowerCase(),
      taskDefinition : taskDef,
    });
  }
}