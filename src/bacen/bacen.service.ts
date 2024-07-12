import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    @InjectModel(BacenSchema.name)
    private readonly bacenModel: Model<BacenSchema>,
  ) {}
  async create(filPath: string) {
    const workBook = xlsx.readFile(filPath);
    const sheetNameList = workBook.SheetNames;

    // Converter a primeira planilha do arquivo para JSON
    const jsonData: any[] = xlsx.utils.sheet_to_json(
      workBook.Sheets[sheetNameList[0]],
    );

    await this.deteleFile(filPath);

    const spreadsheetFormatData = this.formatarChaves(jsonData);

    const spreadSheetFinal = spreadsheetFormatData.map((deposito) => {
      return {
        data_movimento: this.formatValueinDate(deposito.data_movimento),
        devedor_sfn: deposito.devedor_sfn,
        prejuizo_sfn: deposito.prejuizo_sfn,
        vencido_sfn: deposito.vencido_sfn,
        modalidade_bacen: deposito.modalidade_bacen,
        submodalidade_bacen: deposito.submodalidade_bacen,
        cpf_cnpj: deposito.cpf_cnpj,
      };
    });


    await this.verifyDate(spreadSheetFinal[0].data_movimento)

    console.log(
      'Enviando para o banco de dados: ',
      dateFromatter.format(new Date()),
    );
    console.log(spreadSheetFinal[0]);

    await this.bacenModel.insertMany(spreadSheetFinal);

    console.log('Fim da inserção mongoDB: ', dateFromatter.format(new Date()));

    return { message: 'dados de bacen inseridos com sucesso' };
  }

  async createUnique() {
    const save = await this.bacenModel.create({
      data_movimento: new Date(),
      devedor_sfn: 2000,
      prejuizo_sfn: 200,
      vencido_sfn: 0,
      modalidade_bacen: 'vagabundo',
      submodalidade_bacen: 'vabaundo submodalidade',
      cpf_cnpj: '99988877723',
    });

    return save;
  }

  async findAll() {
    console.log('Busca todos services: ', dateFromatter.format(new Date()));

    const data = await this.bacenModel.find({
      modalidade_bacen: 'EMPRESTIMOS',
    });

    console.log('Fim da busca: ', dateFromatter.format(new Date()));
    return data;
  }

  findOne(id: number) {
    return `This action returns a #${id} bacen`;
  }

  async update() {
    const dataUpdate = {
      data_movimento: new Date(),
      devedor_sfn: 2000,
      prejuizo_sfn: 200,
      vencido_sfn: 52145540,
      modalidade_bacen: 'vagabundo de olinda',
      submodalidade_bacen: 'vabaundo submodalidade de onlinda',
      cpf_cnpj: '99988877723',
    };

    const uptade = await this.bacenModel.findOneAndUpdate(
      { cpf_cnpj: '99988877723' },
      dataUpdate,
    );
    return uptade;
  }

  remove(id: number) {
    return `This action removes a #${id} bacen`;
  }

  async deleteMany() {
    await this.bacenModel.deleteMany({});
    return { message: 'Todos os dados de bacen foram removidos' };
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

  async verifyDate(data_movimento: Date) {

   
    const ano = data_movimento.getUTCFullYear();
    const mes = data_movimento.getUTCMonth() + 1; 
    const dia = data_movimento.getUTCDate();

    console.log({
      ano, mes, dia, data_movimento
    })
    const findDateMovimento = await this.bacenModel.findOne({
      $expr: {
        $and: [
          { $eq: [{ $year: '$data_movimento' }, ano] },
          { $eq: [{ $month: '$data_movimento' }, mes] },
          { $eq: [{ $dayOfMonth: '$data_movimento' }, dia] },
        ],
      },
    });

    if (findDateMovimento !== null) {
      throw new BadRequestException('Item encontrado. A inserção não pode continuar pois ja existe dados para essa data de movimento');
    }
    else{

      return ;
    }

  }
}
