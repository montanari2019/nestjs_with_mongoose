import { Injectable } from '@nestjs/common';
import { CreateBacenDto } from './dto/create-bacen.dto';
import { UpdateBacenDto } from './dto/update-bacen.dto';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { Dado } from './entities/data.entities';
import { dateFromatter } from 'src/utils';
import { InjectModel } from '@nestjs/mongoose';
import { BacenDocumentType, BacenSchema } from './schemas/bacen.chema';
import { Model } from 'mongoose';

@Injectable()
export class BacenService {

  constructor(
    @InjectModel(BacenSchema.name) private readonly bacenModel: Model<BacenSchema>

  ){}
  async create(filPath:string) {
    const workBook = xlsx.readFile(filPath);
    const sheetNameList = workBook.SheetNames;

    // Converter a primeira planilha do arquivo para JSON
    const jsonData: any[] = xlsx.utils.sheet_to_json(
      workBook.Sheets[sheetNameList[0]],
    );

    await this.deteleFile(filPath);

    const spreadsheetFormatData = this.formatarChaves(jsonData) 

    const spreadSheetFinal = spreadsheetFormatData.map((deposito) =>{
      return {
      
          data_movimento: this.formatValueinDate(deposito.data_movimento),
          devedor_sfn: deposito.devedor_sfn,
          prejuizo_sfn: deposito.prejuizo_sfn,
          vencido_sfn: deposito.vencido_sfn,
          modalidade_bacen: deposito.modalidade_bacen,
          submodalidade_bacen: deposito.submodalidade_bacen,
          cpf_cnpj: deposito.cpf_cnpj,
      }
    }) 

    console.log("Enviando para o banco de dados: ",dateFromatter.format(new Date()))
    console.log(spreadSheetFinal[0])
    
    await this.bacenModel.insertMany(spreadSheetFinal)

    
    

    // const insertPrisma = await this.prismaService.bacen.createMany({
    //   data: spreadSheetFinal
    // })

    console.log("Fim da inserção mongoDB: ",dateFromatter.format(new Date()))

    return {message: "dados de bacen inseridos com sucesso"};


  }

  findAll() {
    return `This action returns all bacen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bacen`;
  }

  update(id: number, updateBacenDto: UpdateBacenDto) {
    return `This action updates a #${id} bacen`;
  }

  remove(id: number) {
    return `This action removes a #${id} bacen`;
  }

  async deleteMany(){
    await this.bacenModel.deleteMany({})
    return {message: "Todos os dados de bacen foram removidos"};
  }

    
  convertToTimezone(date: Date): Date {
    date.setDate(date.getDate() - 1);
    date.setHours(8, 0, 0, 0);
    return date;
  }

  formatarChaves(dados: Dado[]): Dado[] {
    return dados.map((obj: Dado) => {
      const novoObj: Dado = {};
      for (let chave in obj) {
        let novaChave = chave
          .replace(/ /g, '_')
          .replace(/\//g, '_') // Substitui barras por underscores
          .replace(/º/g, '') // Remove o caractere º
          .toLocaleLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/ç/g, 'C');
        novoObj[novaChave] = obj[chave];
      }
      return novoObj;
    });
  }

  formatValueinDate(valor: number) {
    if (typeof valor === 'number') {
      const data = new Date(1900, 0, Number(valor));
      if (!isNaN(data.getTime())) {
        return this.convertToTimezone(new Date(data.getTime()));
      }
    } else if (typeof valor === 'string') {
      const data = this.convertToTimezone(new Date(valor));
      console.log(data);
      return data;
    }
  }

  async deteleFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('--------------------------------');
        console.log(`${filePath} deletado com sucesso.`);
        console.log('--------------------------------');
      }
    });
  }

}