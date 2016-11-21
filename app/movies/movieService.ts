import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Collectable} from '../../app/movies/collectable';

@Injectable()
export class MovieService {

    constructor(private http: Http) {}
 

    /**
     * @description Function to get movies data from JSON
     * @param {string} language language of movies
     * @param {string} category category of movies
     */
    getMovies(resourcePath:string, language:string, category:string) {

        return this.http.get(resourcePath + language + '/' + category + '.json')
                    .toPromise()
                    .then(res => <Collectable[]> res.json())
                    .then(data => { return data; });
    }

    /**
     * @description Function to get configuration data from JSON
     * @param {string} configURL configuration url 
     */
    getMovieConfig(configURL:string) {

        return this.http.get(configURL)
                    .toPromise()
                    .then(res => res.json())
                    .then(data => { return data; });
    }
}
