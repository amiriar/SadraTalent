import UserModel from "../admin/user/userSchema";
import { IUser } from "../admin/user/userSchema";

export class AuthRepository {
  async findAllAsync(): Promise<IUser[]> {
    return await UserModel.find().select('-password');
  }

  async findByIdAsync(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select('-password');
  }

  async findByUsernameAsync(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username }).select('-password');
  }

  async findByPhoneNumberAsync(phoneNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ phoneNumber }).select('-password');
  }

  async findByEmailAsync(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).select('-password');
  }

  async createAsync(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    const savedUser = await user.save();
    return savedUser.toObject({ transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }});
  }

  async updateAsync(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, userData, { new: true }).select('-password');
  }

  async deleteAsync(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id).select('-password');
  }
}
