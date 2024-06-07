import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interfaces';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;
  
  constructor(
    @InjectModel(Pokemon.name) //NOMBRE DEL MODELO QUE UTILIZARA, EL NAME HACE REFERENCIA AL NOMBRE DEL MODEL NO A NINGUNA PROPIEDAD
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ){}


  async executeSeed(){

    await this.pokemonModel.deleteMany({}); // DELETE * FROM pokemons

    // const { data } = await this.http.get<PokeResponse>(' https://pokeapi.co/api/v2/pokemon?limit=650');
    const data = await this.http.get<PokeResponse>(' https://pokeapi.co/api/v2/pokemon?limit=650');

    // const insertPromisesArray = [];

    // data.results.forEach(({name, url}) => {

    //   const segments = url.split('/');
    //   const no:number = +segments[segments.length - 2];

    //   // this.pokemonService.create({name: name, no: no});
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({name: name, no: no})
    //   );

    // })

    // await Promise.all(insertPromisesArray);

    const pokemonToInsert: {name: string, no: number}[] = [];

    data.results.forEach(({name, url}) => {

      const segments = url.split('/');
      const no:number = +segments[segments.length - 2];

      pokemonToInsert.push({name: name, no: no});

    })

    //INSERTA UN ARRAY DE POKEMONS 
    await this.pokemonModel.insertMany(pokemonToInsert);
    //INSERT INTO pokemons (name, no) VALUES ({'pikachu',1},{'cubone', 2})

    return 'Seed executed';

  }

}
