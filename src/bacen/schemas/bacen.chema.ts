import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BacenDocumentType = HydratedDocument<BacenSchema>;

@Schema({ collection: 'bacen', timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, })
export class BacenSchema {
  @Prop()
  data_movimento: Date;

  @Prop()
  devedor_sfn: number;

  @Prop()
  prejuizo_sfn: number;

  @Prop()
  vencido_sfn: number;

  @Prop()
  modalidade_bacen: string;

  @Prop()
  submodalidade_bacen: string;

  @Prop()
  cpf_cnpj: string;
}

export const BacenSchemaFactory = SchemaFactory.createForClass(BacenSchema);

// id                  String @id @default(auto()) @map("_id") @db.ObjectId
// data_movimento      DateTime
// devedor_sfn         Float
// prejuizo_sfn        Float
// vencido_sfn         Float
// modalidade_bacen    String
// submodalidade_bacen String
// cpf_cnpj            String
// created_at          DateTime  @default(now())
// updated_at          DateTime  @updatedAt
// origem_data         String    @default("MANUAL")
