import { PartialType } from '@nestjs/mapped-types';
import { CreateBacenDto } from './create-bacen.dto';

export class UpdateBacenDto extends PartialType(CreateBacenDto) {}
