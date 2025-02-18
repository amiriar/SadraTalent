import { IUser } from "./userSchema";
import UserModel from "./userSchema";

export class UserRepository {
  async findAllAsync(): Promise<IUser[]> {
    return await UserModel.find().select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
  }

  async findByIdAsync(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
  }

  async findByRefreshTokenAsync(token: string): Promise<IUser | null> {
    return await UserModel.findOne({ refreshToken: token }).select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
  }

  async findByUsernameAsync(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username }).select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
  }

  async findByPhoneAsync(phoneNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ phoneNumber }).select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
  }

  async findByEmailAsync(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).select(
      "-firstname -lastname -profile -bio -status -lastSeen -stories -customStatus -__v"
    );
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
