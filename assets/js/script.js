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
var tmdbSearchApiUrl = 'https://api.themoviedb.org/3/search/movie';

// API key and URL for accessing IMDb API
var imdbApiKey = '9b559a8572msh413c7f476033e46p13acf3jsnd8b1f4ec1384';
var imdbBaseUrl = 'https://imdb8.p.rapidapi.com/auto-complete?q=';

// Function to handle the search for movies using both TMDB and IMDb APIs
async function searchMovies() {
    // Varible used to retrieve user search input (movie title)
    var searchTerm = document.getElementById('searchInput').value;

    // Search movies using TMDB API
    try {
        var tmdbResults = await searchTmdbMovies(searchTerm);

        // Search movies using IMDb API
        try {
            var imdbResults = await searchImdbMovies(searchTerm);

            // Combine TMDB and IMDb results to create movie cards
            var combinedResults = combineResults(tmdbResults, imdbResults);

            // Display the combined movie cards
            displayResults(combinedResults);
        } catch (error) {
            console.error('IMDb API Error:', error);
        }
    } catch (error) {
        console.error('TMDB API Error:', error);
    }
}

// Function to search for movies on TMDB API
async function searchTmdbMovies(query) {
    var url = `${tmdbSearchApiUrl}?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`;
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

// Function to create a movie card with provided movie information
function createMovieCard(title, releaseDate, imageUrl, tmdbDescription, imdbDescription, imdbId) {
    var movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.style.backgroundColor = '#444';
    var releaseDateString = releaseDate ? dayjs(releaseDate).format('MM-DD-YYYY') : 'N/A';

    // Declare the IMDb link variable with an empty string
    var imdbLink = '';

    // Conditionally set the IMDb link if imdbId is available
    if (imdbId) {
        imdbLink = `https://www.imdb.com/title/${imdbId}`;
    }

    // Creating the movie card that will be displayed for each search result
    movieCard.innerHTML = `<h2><strong>${title}</strong></h2>
                           <p>Release Date: ${releaseDateString}</p>
                           <img src="https://image.tmdb.org/t/p/w185/${imageUrl}" alt="${title} poster">
                           <br>
                           <p><strong>Actors:</strong> ${imdbDescription}</p>
                           <p>${tmdbDescription}</p>`;

    // Conditionally add the IMDb link if imdbId is available
    if (imdbLink) {
        movieCard.innerHTML += `<p><strong>IMDb Link: </strong><em><a href="${imdbLink}" target="_blank">${imdbLink}</a></em></p>`;
    }

    // Add the "Add to Watchlist" button with the corresponding CSS class
    movieCard.innerHTML += '<button class="button is-info addToWatchlistButton">Add to Watchlist</button><br>';

    // Add event listener to the "Add to Watchlist" button
    movieCard.querySelector('.addToWatchlistButton').addEventListener('click', function () {
        addToWatchlist({
            title: title,
            releaseDate: releaseDate,
            imageUrl: imageUrl,
            tmdbDescription: tmdbDescription,
            imdbDescription: imdbDescription,
            imdbId: imdbId
        });
    });

    return movieCard;
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

                // Create the movie card using the createMovieCard function
                var movieCard = createMovieCard(
                    movie.title,
                    movie.releaseDate,
                    movie.imageUrl,
                    tmdbDescription,
                    imdbDescription,
                    movie.imdbId
                );

                // Append the movie card to the results container
                resultsContainer.appendChild(movieCard);
            }
        }
    }
}

// Function to handle adding movies to the watchlist
function addToWatchlist(movie) {
    // Get the current watchlist data from localStorage or an empty array if it's not set yet
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    // Check if the movie is already in the watchlist
    var movieExists = watchlist.some(m => m.title === movie.title);

    if (!movieExists) {
        // Add the movie to the watchlist array
        watchlist.push(movie);
        // Save the updated watchlist data back to localStorage
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        // Inform the user that the movie has been added to the watchlist
        alert('Movie added to watchlist!');
    } else {
        // Inform the user that the movie is already in the watchlist
        alert('This movie is already in your watchlist!');
    }
}