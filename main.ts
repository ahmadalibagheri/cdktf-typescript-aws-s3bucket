import { Construct } from 'constructs';
import { App, TerraformOutput, TerraformStack } from 'cdktf';
import { AwsProvider, s3 } from './.gen/providers/aws';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: 'us-east-1',
    });

    const BUCKET_NAME = 'cdktf-typescript-demo-us-east-1';

    const bucket = new s3.S3Bucket(this, 'aws_s3_bucket', {
      bucket: BUCKET_NAME,
      lifecycleRule: [
        { enabled: true, id: 'abort-multipart', prefix: '/', abortIncompleteMultipartUploadDays: 7 },
        { enabled: true, transition: [{ days: 30, storageClass: 'STANDARD_IA' }] },
        { enabled: true, noncurrentVersionTransition: [{ days: 30, storageClass: 'STANDARD_IA' }] },
        { enabled: false, transition: [{ days: 90, storageClass: 'ONEZONE_IA' }] },
        { enabled: false, noncurrentVersionTransition: [{ days: 90, storageClass: 'ONEZONE_IA' }] },
        { enabled: false, transition: [{ days: 365, storageClass: 'GLACIER' }] },
        { enabled: false, noncurrentVersionTransition: [{ days: 365, storageClass: 'ONEZONE_IA' }] },
      ],
      tags: {
        Team: 'Devops',
        Company: 'Your compnay',
      },
      policy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
              "s3:GetObject"
            ],
            "Resource": [
              "arn:aws:s3:::${BUCKET_NAME}/*"
            ]
          }
        ]
      }`,
    });

    new TerraformOutput(this, 'S3 id', {
      value: bucket.id,
    });

    new TerraformOutput(this, 'S3 arn', {
      value: bucket.arn,
    });
  }
}

const app = new App();
new MyStack(app, 'aws-s3');
app.synth();
