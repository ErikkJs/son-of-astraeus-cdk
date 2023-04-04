import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import {Construct} from 'constructs';
import {SecretValue} from 'aws-cdk-lib';

interface CdkPipelineStackProps extends cdk.StackProps {
  pipeline: {
    projectName: string;
    buildSpec: codebuild.BuildSpec;
    stackName: string;
    stackParameters: Record<string, string>;
  };
  GitProperties: {
    owner: string;
    repo: string;
    oauthToken: string;
    branch: string;
  };
}

export class CdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkPipelineStackProps) {
    super(scope, id, props);

    // Create a CodeBuild project for the pipeline
    const project = new codebuild.PipelineProject(this, props.pipeline.projectName, {
      buildSpec: props.pipeline.buildSpec,
    });

    // Define the source action for the pipeline
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipelineActions.GitHubSourceAction({
      actionName: `${props.pipeline.projectName}-source`,
      owner: props.GitProperties.owner,
      repo: props.GitProperties.repo,
      oauthToken: SecretValue.unsafePlainText(props.GitProperties.oauthToken),
      output: sourceOutput,
      branch: props.GitProperties.branch,
      trigger: codepipelineActions.GitHubTrigger.POLL,
    });

    // Define the build action for the pipeline
    const buildOutput = new codepipeline.Artifact('BuildOutput');
    const buildAction = new codepipelineActions.CodeBuildAction({
      actionName: `${props.pipeline.projectName}-build`,
      project,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    // Define the deploy action for the pipeline
    const deployAction = new codepipelineActions.CloudFormationCreateUpdateStackAction({
      actionName: `${props.pipeline.projectName}-deploy`,
      templatePath: buildOutput.atPath(`${props.pipeline.stackName}.template.json`),
      stackName: props.pipeline.stackName,
      adminPermissions: true,
      parameterOverrides: props.pipeline.stackParameters,
      extraInputs: [sourceOutput],
    });

    // Create the pipeline
    new codepipeline.Pipeline(this, `${props.pipeline.projectName}-pipeline`, {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
        {
          stageName: 'Deploy',
          actions: [deployAction],
        },
      ],
    });
  }
}
