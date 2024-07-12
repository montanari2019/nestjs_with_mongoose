import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BacenModule } from './bacen/bacen.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL, {
      authSource: 'admin',
    }),
    BacenModule,
   
    // MongooseModule.forRoot("mongodb://credisulmongo:sicoob2024@localhost:27017/nestjs", {
    //   authSource: "admin"
    // })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
