import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const userCount = await this.userModel.countDocuments();
    if (userCount === 0) {
      this.logger.log('No users found in database. Seeding default Admin and Staff users...');
      
      const adminPassword = await bcrypt.hash('Admin@123456', 10);
      await this.userModel.create({
        name: 'Administrator',
        email: 'admin@inventory.com',
        password: adminPassword,
        role: 'Admin',
      });
      this.logger.log('Default admin seeded: admin@inventory.com / Admin@123456');

      const staffPassword = await bcrypt.hash('Staff@123456', 10);
      await this.userModel.create({
        name: 'Staff Member',
        email: 'staff@inventory.com',
        password: staffPassword,
        role: 'Staff',
      });
      this.logger.log('Default staff seeded: staff@inventory.com / Staff@123456');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(userData.password || 'User@123456', 10);
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    return user.save();
  }
}
