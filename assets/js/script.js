// const settings = {
// 	async: true,
// 	crossDomain: true,
// 	url: 'https://imdb-search2.p.rapidapi.com/oppenheimer',
// 	method: 'GET',
// 	headers: {
// 		'X-RapidAPI-Key': '249f566bbdmsh5a8a690f2cf015ap1db355jsn44e4a97a11da',
// 		'X-RapidAPI-Host': 'imdb-search2.p.rapidapi.com'
// 	}
// };

// $.ajax(settings).done(function (response) {
// 	console.log(response);
// });

// Added:
// API key for accessing The Movie Database (TMDB) API
var apiKey = 'a16cc6bba8e2db52eca5d51f65ad6960';
// Base URL for searching movies on TMDB API
var searchApiUrl = 'https://api.themoviedb.org/3/search/movie';
// Base URL for fetching movie details on TMDB API
var movieDetailsUrl = 'https://api.themoviedb.org/3/movie';

// Function to search for movies based on the user input
function searchMovies() {
    // Get the search query from the input field
    var query = document.getElementById('searchInput').value;

    // If the query is empty or contains only spaces, show an alert and return
    if (query.trim() === '') {
        alert('Please enter a movie title'); // ** REPLACE ALERT W/ MODAL **
        return;
    }

    // Fetch movie data from TMDB API based on the search query
    fetch(`${searchApiUrl}?api_key=${apiKey}&query=${query}`)
        .then(response => response.json())
        // Call the displayResults function with the search results
        .then(data => displayResults(data.results)) 
        .catch(error => console.error('Error fetching data:', error));
}

// Function to get the movie details based on the movie ID
async function getMovieDetails(movieId) {
    // Fetch movie details from TMDB API based on the movie ID
    return fetch(`${movieDetailsUrl}/${movieId}?api_key=${apiKey}`)
        .then(response => response.json())
        // Extract the plot overview from the fetched data
        .then(data => data.overview) 
        .catch(error => {
            console.error('Error fetching movie details:', error);
            return 'Synopsis not available'; 
        });
}

// Function to get the IMDb ID based on the movie ID
function getImdbId(movieId) {
    // Fetch IMDb ID from TMDB API based on the movie ID
    return fetch(`${movieDetailsUrl}/${movieId}/external_ids?api_key=${apiKey}`)
        .then(response => response.json())
        // Extract the IMDb ID from the fetched data
        .then(data => data.imdb_id) 
        .catch(error => {
            console.error('Error fetching IMDb ID:', error);
            return 'N/A'; 
        });
}

// Function to display the search results on the webpage
async function displayResults(results) {
    // Get the element where search results will be displayed
    var searchResults = document.getElementById('searchResults');

    // Clear the previous search results
    searchResults.innerHTML = '';

    // If no results were found, show a message indicating that
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
    } else {
        // Loop through each movie in the search results
        for (var i = 0; i < results.length; i++) {
            var movie = results[i];
            // Format the release date using Day.js library
            var releaseDate = dayjs(movie.release_date).format('MM-DD-YYYY');

            // Create a new element to represent the movie card
            var movieCard = document.createElement('div');

            // Populate the movie card with movie information
            movieCard.innerHTML = `<h2>${movie.title}</h2>
                                   <p>Release Date: ${releaseDate}</p>
                                   <img src="https://image.tmdb.org/t/p/w185/${movie.poster_path}" 
                                   alt="${movie.title} poster">`;

            // Get the plot overview for the movie and add it to the movieCard
            var plotOverview = await getMovieDetails(movie.id);
            var plotElement = document.createElement('p');
            plotElement.textContent = plotOverview;
            movieCard.appendChild(plotElement);

            // Get the IMDb ID for the movie and add it to the movieCard as plain text
            var imdbId = await getImdbId(movie.id);
            var imdbIdNum = document.createElement('p');
            imdbIdNum.textContent = `IMDb ID: ${imdbId}`;
            movieCard.appendChild(imdbIdNum);

            // Append the movie card to the search results container
            searchResults.appendChild(movieCard);
        }
    }
}

// Add a click event listener to the search button
document.getElementById('searchButton').addEventListener('click', searchMovies);