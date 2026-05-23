import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize the AWS DynamoDB Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'CareerAdvisorData';

// GET: Fetch profiles/advice from DynamoDB
export async function GET() {
  try {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    return NextResponse.json(response.Items, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save user career preferences to DynamoDB
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, careerGoal } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        email: email, // This will be your Partition Key in DynamoDB
        name: name,
        careerGoal: careerGoal || 'Undecided',
        createdAt: new Date().toISOString(),
      },
    });

    await docClient.send(command);
    return NextResponse.json({ message: 'Data saved successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
