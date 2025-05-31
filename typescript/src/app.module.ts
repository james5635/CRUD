import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // change as needed
      password: 'james@2025', // change as needed
      database: 'nest_crud',
      autoLoadEntities: true,
      synchronize: true, // disable in production
    }),
    TasksModule,
  ],
})
export class AppModule {}
