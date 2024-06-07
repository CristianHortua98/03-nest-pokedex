import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name) //NOMBRE DEL MODELO QUE UTILIZARA, EL NAME HACE REFERENCIA AL NOMBRE DEL MODEL NO A NINGUNA PROPIEDAD
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService

  ){

    // console.log(process.env.DEFAULT_LIMIT);
    this.defaultLimit = configService.get<number>('defaultLimit')
    // console.log(this.defaultLimit);

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
      
    }catch(error){

      this.handleExceptions(error);

      // console.log(error);
      // if(error.code === 11000){

      //   throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);

      // }

      // console.log(error);
      // throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);


    }

  }

  findAll(paginationDto:PaginationDto) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({no: 1})
      .select('-__v');
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    //no
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //Mongo ID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    //Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()});
    }

    if(!pokemon){
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found.`);
    }


    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    // const updatedPokemon = await pokemon.updateOne(updatePokemonDto, {new: true});

    try {

      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto};
      
    }catch(error){

      this.handleExceptions(error);
      
    }


  }

  async remove(id: string) {

    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return {id}
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    }

    return;

  }

  private handleExceptions(error: any){

    if(error.code === 11000){

      throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);

    }

    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);


  }

}
