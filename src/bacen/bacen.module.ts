import { Module } from '@nestjs/common';
import { BacenService } from './bacen.service';
import { BacenController } from './bacen.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BacenSchema, BacenSchemaFactory } from './schemas/bacen.chema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BacenSchema.name,
        schema: BacenSchemaFactory,
      },
    ])
  ],
  controllers: [BacenController],
  providers: [BacenService],
})
export class BacenModule {}
