import MessageModel, { IMessage } from "./messagesSchema";
export class MessageRepository {
  async getMessagesBetweenUsersByMongoId(
    senderId: string,
    receiverId: string,
    page: string,
    limit: string
  ): Promise<IMessage[] | null> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    return await MessageModel.find({
      sender: senderId,
      receiver: receiverId,
    })
      .skip(skip)
      .limit(limitNumber);
  }

  async getAllMessages(
    page: string,
    limit: string
  ): Promise<IMessage[] | null> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
    return await MessageModel.find()
      .skip(skip)
      .limit(limitNumber);
  }
}
