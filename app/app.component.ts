import {Component, Input } from '@angular/core';
import {Collectable} from './movies/collectable';
import {MovieService} from './movies/movieService'; 

class Movie implements Collectable {

    constructor(public name?, public year?, public printQuality?, public fileName?, public seriesName?, public isHindi? ) {}
}

@Component({
	templateUrl: './app/app.component.html',
	selector: 'my-app' 
})
export class AppComponent {

    private displayDialog: boolean;

    private movie: Collectable = new Movie();

    private selectedMovie: Collectable;

    private newMovie: boolean;

    private movies: Collectable[];

    private configURL:string = 'app/resources/config.json';
    private resourcePath:string = null;
    private dataTable = {
        selectionMode: "single",
        paginator: true,
        rows:  10,
        responsive: true,
        cols: [
            {field: 'name', header: 'Name', sortable: true},
            {field: 'year', header: 'Year', sortable: true},
            {field: 'seriesName', header: 'Series Name', sortable: true},
            {field: 'printQuality', header: 'Print Quality', sortable: true},
            {field: 'isHindi', header: 'Hindi', sortable: true}
        ],
        
        filters: { 
            hindi: {
                isSelected: false,
                text: 'Hindi'
            }, 
            printQualities: null,
            categories: null,                
            language: 'English',
            allCategoriesSelected: true    
        } 
    };
    
    constructor(private movieService: MovieService) { }

    ngOnInit() { 

          this.loadConfig();
    }
    
    /**
     * @description Function to load application configuration
     */
    loadConfig() {
        let context = this;
        context.movieService.getMovieConfig(context.configURL)            // Load Movies data from JSON
                 .then(config => {                          
                     context.dataTable.filters.categories = config.categories;
                     context.resourcePath = config.resourcePath;
                     context.dataTable.filters.printQualities = config.printQualities;
                     this.loadMovies();
                 });
    }
    /**
     * @description Function to load movies fulfilling the fitler conditions
     */
    loadMovies() {
        
        let context = this;            
            
            context.movies = [];
            let filteredMovies = [];
            for(let i=0; i<context.dataTable.filters.categories.length; i++) {
                if(!context.dataTable.filters.categories[i].isSelected && !this.dataTable.filters.allCategoriesSelected){
                    continue;
                }               
                context.movieService.getMovies(context.resourcePath, context.dataTable.filters.language, 
                                         context.dataTable.filters.categories[i].name)            // Load Movies data from JSON
                 .then(movies => {                          
                        filteredMovies = [];
                         for(let j=0; j<movies.length; j++) {
                             if(context.dataTable.filters.hindi.isSelected) {                     
                                 if(movies[j].isHindi && context.applyPrintFilters(movies[j]) !== null) {                                     
                                    filteredMovies.push(movies[j]);                                                                              
                                 }
                             }else {
                                if(context.applyPrintFilters(movies[j]) !== null) {                                     
                                    filteredMovies.push(movies[j]);                                                                              
                                 }
                             }    
                         }
                         
                         if(filteredMovies.length > 0) {                                         // Apply filters on the data received
                             context.movies  =  context.movies.concat(filteredMovies);
                         }/*else{
                             context.movies  =  filteredMovies;
                         }*/
                         
                 }); 
            }                           
    }

    /**
     * @description Function to apply quality filters on a movie. Returns movie object if filters are applied successfully otherwise it will return null.
     * @param {Collectable} movie movie on which the print quality fitlers will be applied
     */
    applyPrintFilters(movie: Collectable) {

        let isFilterApplied:boolean = false;
        for(let i=0; i< this.dataTable.filters.printQualities.length; i++ ) {

            if( this.dataTable.filters.printQualities[i].isSelected ) { 
                isFilterApplied = true;
                if(this.dataTable.filters.printQualities[i].name === movie.printQuality) {
                    return movie;
                }
            }            
        }

        return isFilterApplied?null:new Movie();
    }

    /**
     * @description Function to reset all categories to true/false
     */

   resetAllCategories(status) {       
       let context = this;
        for(let i=0; i<context.dataTable.filters.categories.length; i++) {
            context.dataTable.filters.categories[i].isSelected = status;
        }
         context.loadMovies();
   }


    showDialogToAdd() {
        this.newMovie = true;
        this.movie = new Movie();
        this.displayDialog = true;
    }

    save() {
        if(this.newMovie)
            this.movies.push(this.movie);
        else
            this.movies[this.findSelectedMovieIndex()] = this.movie;

        this.movie = null;
        this.displayDialog = false;
    }

    delete() {
        this.movies.splice(this.findSelectedMovieIndex(), 1);
        this.movie = null;
        this.displayDialog = false;
    }

    onRowSelect(event) {
        this.newMovie = false;
        this.movie = this.cloneMovie(event.data);
        this.displayDialog = true;
    }

    cloneMovie(c: Collectable): Collectable {
        let movie = new Movie();
        for(let prop in c) {
            movie[prop] = c[prop];
        }
        return movie;
    }

    findSelectedMovieIndex(): number {
        return this.movies.indexOf(this.selectedMovie);
    }

    /**
     * Function to toggle the all categories selected checkbox
     * @param {boolean} allCategoriesSelected 
     */
    toggleAllCategories (allCategoriesSelected: boolean) {
        this.dataTable.filters.allCategoriesSelected = allCategoriesSelected;
        this.loadMovies();
    }

    /**
     * Function to select movies of a category 
     * @param {boolean} allCategoriesSelected 
     */
    selectCategory (category) {
        category.isSelected = !category.isSelected;
        if(category.isSelected && this.dataTable.filters.allCategoriesSelected) {
            this.dataTable.filters.allCategoriesSelected = false;    
        } 
        this.loadMovies();
    }

}
