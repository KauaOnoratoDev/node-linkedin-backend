import { AppDataSource } from './data-source';

export class Database {
  static async connect() {
    try {
      await AppDataSource.initialize();
      console.log('🚀 Database connected!');
    } catch (error) {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    }
  }

  static getDataSource() {
    return AppDataSource;
  }
}
