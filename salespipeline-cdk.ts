//S3 bucket deployment and uploading data through AWS CDK. Cleaning with Glue.
//April 22, 2022
//AWS Data Engineering Project

//importing necessary dependencies
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as glue from '@aws-cdk/aws-glue';
import * as iam from '@aws-cdk/aws-iam';

//creating cdk stack
export class SalesAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
  super(scope, id, props);

//creating s3 bucket    
  const sales_data_0422 = new s3.Bucket(this, 'SalesBucket-0422', {
    versioned: false,
    publicReadAccess: true,
    removalPolicy: cdk.RemovalPolicy.RETAIN
});
  
//deploying data to the s3 bucket  
  new s3deploy.BucketDeployment(this, 'DeployDataFile-0422', {
    sources: [s3deploy.Source.asset('./salesdata')],
    destinationBucket: sales_data_0422,
    retainOnDelete: false,
    destinationKeyPrefix: 'data_uncrawled/salespipeline'
});

//creating database for glue crawler destination//

  const glue_database = new glue.Database(this, 'SalesGlueDB', {
    databaseName: 'salespipeline_database'
});
  let glue_role = new iam.Role( this, 'glue_role_id24', {
    roleName: 'Rolename',
    assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
    managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')]
  }
);
  let targetPath = 's3://' + sales_data_0422.bucketName + '/data_uncrawled/salespipeline';
    console.log('targetPath: ' + targetPath)

  let salescrawler = new glue.CfnCrawler(this, 'salespipeline_crawler', {
    role: glue_role.roleName,
    targets: { "s3Targets": [{ path: targetPath }] },
    databaseName: glue_database.databaseName,
    name: 'salespipeline_crawler',
    description: 'sales_data_tables_crawler',
    tablePrefix: 'sales_'
});
  // done creating crawler //
  }
}