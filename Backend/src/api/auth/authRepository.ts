import UserModel from "../admin/user/userSchema";
import { IUser } from "../admin/user/userSchema";

export class AuthRepository {
  async findAllAsync(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async findByIdAsync(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByUsernameAsync(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username });
  }

  async findByPhoneNumberAsync(phoneNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ phoneNumber });
  }

  async findByEmailAsync(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async createAsync(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async updateAsync(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteAsync(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
