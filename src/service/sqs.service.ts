import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../config/sqsConfig";

export class SQSService {
  async sendMessage(message: unknown) {
    const command = new SendMessageCommand({
      QueueUrl: process.env.USER_SYNC_QUEUE_URL!,
      MessageBody: JSON.stringify(message),
    });

    return sqsClient.send(command);
  }
}

export const sqsService = new SQSService();