// Find the search button element by its ID
var searchButton = document.getElementById('searchButton');
// Find the input field element by its ID
var searchInput = document.getElementById('searchInput');

// Add a click and keypress event listener to the search button
searchButton.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
});

// API key and URL for accessing The Movie Database (TMDB) API
var tmdbApiKey = 'a16cc6bba8e2db52eca5d51f65ad6960';
var tmdbBaseUrl = 'https://api.themoviedb.org/3/search/movie';

// API key and URL for accessing IMDb API
var imdbApiKey = '9b559a8572msh413c7f476033e46p13acf3jsnd8b1f4ec1384';
var imdbBaseUrl = 'https://imdb8.p.rapidapi.com/auto-complete?q=';

// Function to handle the search for movies using both TMDB and IMDb APIs
function searchMovies() {
    // Varible used to retrieve user search input (movie title)
    var searchTerm = document.getElementById('searchInput').value;

    // Search movies using TMDB API
    searchTmdbMovies(searchTerm)
        .then(tmdbResults => {
            // Search movies using IMDb API
            searchImdbMovies(searchTerm)
                .then(imdbResults => {
                    // Combine TMDB and IMDb results to create movie cards
                    var combinedResults = combineResults(tmdbResults, imdbResults);
                    // Printing results to console
                    console.log(combinedResults);
                    // Display the combined movie cards
                    displayResults(combinedResults);
                })
                .catch(error => console.error('IMDb API Error:', error));
        })
        .catch(error => console.error('TMDB API Error:', error));
}

// Function to search for movies on TMDB API
async function searchTmdbMovies(query) {
    var url = `${tmdbBaseUrl}?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`;
    try {
        var response = await fetch(url);
        var data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        return [];
    }
}

// Function to search for movies on IMDb API
async function searchImdbMovies(query) {
    var url = `${imdbBaseUrl}${encodeURIComponent(query)}`;
    var options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': imdbApiKey,
            'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
        }
    };

    try {
        var response = await fetch(url, options);
        var data = await response.json();
        return data.d;
    } catch (error) {
        console.error('Error fetching IMDb data:', error);
        return [];
    }
}

// Function to combine results from TMDB and IMDb based on movie titles
function combineResults(tmdbResults, imdbResults) {
    var combinedResults = [];

    for (var i = 0; i < tmdbResults.length; i++) {
        var tmdbMovie = tmdbResults[i];
        // Find matching IMDb movie based on title
        var imdbMovie = imdbResults.find(imdbMovie => imdbMovie.l === tmdbMovie.title);

        // Combine data from both APIs
        var combinedMovie = {
            title: tmdbMovie.title,
            releaseDate: tmdbMovie.release_date,
            imageUrl: tmdbMovie.poster_path,
            tmdbDescription: tmdbMovie.overview,
            imdbDescription: imdbMovie ? imdbMovie.s : null,
            imdbId: imdbMovie && imdbMovie.id ? imdbMovie.id : null // Retrieve the IMDb ID from the IMDb API response
        };

        combinedResults.push(combinedMovie);
    }

    return combinedResults;
}

// Function to display the combined movie data as movie cards
function displayResults(results) {
    var resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
    } else {
        for (var movie of results) {
            // Check if all the necessary properties are present to avoid displaying incomplete data
            if (movie.title && movie.releaseDate && movie.imageUrl) {
                // Set 'N/A' for actors if imdbDescription is not available
                var imdbDescription = movie.imdbDescription || 'N/A';
                // Set 'N/A' for plot overview if tmdbDescription is not available
                var tmdbDescription = movie.tmdbDescription || 'N/A';
                // Display combined movie data in the movie card
                var movieCard = createMovieCard(movie.title, movie.releaseDate, movie.imageUrl, tmdbDescription, imdbDescription, movie.imdbId);
                resultsContainer.appendChild(movieCard);
            }
        }
    }
}

// Function to create a movie card with provided movie information
function createMovieCard(title, releaseDate, imageUrl, tmdbDescription, imdbDescription, imdbId) {
    var movieCard = document.createElement('div');
    var releaseDateString = releaseDate ? dayjs(releaseDate).format('MM-DD-YYYY') : 'N/A';
    // Creating the movie card that will be displayed for each search result
    movieCard.innerHTML =
    // `<div class="card">
    //     <div class="card-image">
    //     <figure>
    //         <img src="https://image.tmdb.org/t/p/w185/${imageUrl}" alt="${title} poster">
    //     </figure>
    //      </div>

    //     <div class="card-content">
    //         <div class="content">
    //             <h2><strong>${title}</strong></h2>
    //             <p class="subtitle is-6">Release Date: ${releaseDateString}</p>
    //             <p><strong>Actors:</strong> ${imdbDescription}</p>
    //             <p><strong>Plot:</strong> ${tmdbDescription}</p>
    //         </div>
    //     </div>
                                
    // </div>`;

`
<div class="columns">
<div class="column is-three-quarters">
<div class="card">

    <div class="card-image">
    <figure class="image is-3by4">
    <img src="https://image.tmdb.org/t/p/w185/${imageUrl}" alt="${title} poster">
  </figure>
    </div>      


    <div class="card-content">
      <div class="media">
        <div class="media-content">
  
          <p class="title is-4">${title}</p>
          <p class="subtitle is-6">Release Date: ${releaseDateString}</p>
        </div>
      </div>
  
      <div class="content">
      <p><strong>Actors:</strong> ${imdbDescription}</p>
                 <p><strong>Plot:</strong> ${tmdbDescription}</p>
      </div>
    </div>
  </div>
  </div>
  </div>`;


    
    // Conditionally add the IMDb link if imdbId is available
    if (imdbId) {
        var imdbLink = `https://www.imdb.com/title/${imdbId}`;
        movieCard.innerHTML += `<p><strong>IMDb Link: </strong><em><a href="${imdbLink}" target="_blank">${imdbLink}</a></em></p>`;
    }

    movieCard.innerHTML += '<br>';

    return movieCard;
}