import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

export class InfraStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Get the branch name from the environment variable
        const branchName = process.env.BRANCH_NAME || 'default-branch'; // Fallback to a default value if not set

        // Create a unique S3 bucket name based on the branch name
        const bucketName = `react-app-bucket-${branchName.replace(/\//g, '-')}`; // Replace slashes to avoid invalid characters

        // Create an S3 bucket for hosting the React application
        const bucket = new Bucket(this, 'ReactAppBucket', {
            bucketName: bucketName,
            websiteIndexDocument: 'index.html', // Main entry point for the website
            websiteErrorDocument: 'index.html',  // Redirect to index.html on error (for client-side routing)
            publicReadAccess: true,               // Allow public access to the bucket
            blockPublicAccess: BlockPublicAccess.BLOCK_ACLS, // Block ACLs to enhance security
            accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL, // Full control for the bucket owner
        });

        // Deploy the built React app files to the S3 bucket
        new BucketDeployment(this, 'DeployReactApp', {
            sources: [Source.asset('../build')], // Adjust path if necessary to point to your build directory
            destinationBucket: bucket,
        });

        // Output the website URL after deployment
        new CfnOutput(this, 'WebsiteURL', {
            value: bucket.bucketWebsiteUrl,
            description: 'The URL of the S3 website',
        });
    }
}