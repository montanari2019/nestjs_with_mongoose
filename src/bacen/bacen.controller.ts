import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UploadedFile, UseInterceptors, Put, Query } from '@nestjs/common';
import { BacenService } from './bacen.service';
import { CreateBacenDto } from './dto/create-bacen.dto';
import { UpdateBacenDto } from './dto/update-bacen.dto';
import { dateFromatter } from 'src/utils';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('bacen')
export class BacenController {
  constructor(private readonly bacenService: BacenService) {}

  @Post('create')
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
      limits: {
        fileSize: 1024 * 1024 * 150,
      },
    }),
  )
  @ApiOkResponse({
    description:
      'Rota para inserção dados via upload de arquivo excel ou csv',
    isArray: true,
  })
  create(@UploadedFile() file: Express.Multer.File) {
    if (file === undefined) throw new NotFoundException('No file');
    console.log("Upload file controle: ",dateFromatter.format(new Date()))
    const SheetNames = file.originalname.split('.');
    const fileType = SheetNames[SheetNames.length - 1];

    // console.log(fileType);

    if (fileType !== 'xlsx') throw new NotFoundException('type file not supported')
    
      return this.bacenService.create(file.path)
  }
  @Get()
  findAll() {
    console.log("Busca todos controler: ",dateFromatter.format(new Date()))
    return this.bacenService.findAll();
  }

  @Post()
  createUnique() {
    return this.bacenService.createUnique();
  }


  @Put()
  updateOne(){
    return this.bacenService.update()
  }

  @Delete()
  deleteMany(){
    return this.bacenService.deleteMany()
  }

  @Get("get/date")
  @ApiQuery({ name: 'data_movimento', required: true })
  findDateMovimento(  @Query('data_movimento') data_movimento: string,){

    return this.bacenService.verifyDate(new Date(data_movimento))
  }
}
