import RoomModel, { IRoom } from "./roomsSchema";

export class RoomRepository {
  async getAllRooms(page: string, limit: string): Promise<IRoom[] | null> {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return await RoomModel.find({}).skip(skip).limit(parseInt(limit));
  }

  async getRoomById(roomId: string): Promise<IRoom | null> {
    return await RoomModel.findOne({
      _id: roomId,
    });
  }

  async updateRoomById(roomId: string, newData: IRoom): Promise<IRoom | null> {
    return await RoomModel.findByIdAndUpdate(
      {
        _id: roomId,
      },
      newData,
      { new: true }
    );
  }

  async deleteRoomById(roomId: string): Promise<boolean> {
    const room = await RoomModel.findByIdAndUpdate(
      {
        _id: roomId,
      },
      { isDeleted: true }
    );

    if (!room) return false;
    return true;
  }
}
