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

function createMovieCard(title, releaseDate, imageUrl, tmdbDescription, imdbDescription, imdbId) {
    var movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.style.backgroundColor = '#444';
    movieCard.style.display = 'flex';
    movieCard.style.flexDirection = 'column';
    movieCard.style.justifyContent = 'space-around';

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
                            <p><strong>Actors:</strong> ${imdbDescription}</p>
                            <p class="movie-description">${tmdbDescription}</p>`;

    // Creating the IMDb logo image element
    var imdbLogoImg = document.createElement('img');
    imdbLogoImg.src = './assets/images/imdb.png';
    imdbLogoImg.alt = 'IMDb';
    imdbLogoImg.style.width = '80px';
    imdbLogoImg.style.height = 'auto';
    imdbLogoImg.style.borderRadius = '8px';
    imdbLogoImg.style.transform = 'scale(1.0)';

    // Creating a mouseover effect that makes the imdbLogoImg slightly larger when hovered over
    imdbLogoImg.addEventListener('mouseover', function () {
        imdbLogoImg.style.transition = 'transform 0.2s ease';
        imdbLogoImg.style.transform = 'scale(1.1)';
    });

    imdbLogoImg.addEventListener('mouseout', function () {
        imdbLogoImg.style.transition = 'transform 0.2s ease';
        imdbLogoImg.style.transform = 'scale(1.0)';
    });

    // Creating the IMDb link element
    var imdbLinkElement = document.createElement('a');
    imdbLinkElement.href = imdbLink;
    imdbLinkElement.target = '_blank';
    imdbLinkElement.appendChild(imdbLogoImg);

    // Append the IMDb link to the movie card
    var imdbLinkContainer = document.createElement('p');
    imdbLinkContainer.classList.add('imdb-link');
    imdbLinkContainer.appendChild(imdbLinkElement);
    movieCard.appendChild(imdbLinkContainer);

    // Creating the Font Awesome icon element
    var heartIcon = document.createElement('i');
    heartIcon.classList.add('fa-regular', 'fa-heart', 'fa-2xl');
    heartIcon.style.color = '#ffa200';
    heartIcon.style.paddingBottom = '10px';

    // Check if the movie is in the watchlist
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    var movieIndex = watchlist.findIndex(m => m.title === title);
    if (movieIndex !== -1) {
        // Movie is in the watchlist, so set the icon to the pink version
        heartIcon.classList.remove('fa-regular');
        heartIcon.classList.add('fa-solid', 'fa-heart', 'fa-2xl');
        heartIcon.style.color = '#f494cc';
    }

    // Add the Font Awesome icon to the movie card
    movieCard.appendChild(heartIcon);

    // Function to toggle the icon style when clicked
    function toggleIcon() {
        if (heartIcon.classList.contains('fa-regular')) {
            // Icon is in regular state, switch to solid state and add to watchlist
            heartIcon.classList.remove('fa-regular');
            heartIcon.classList.add('fa-solid', 'fa-heart', 'fa-2xl');
            heartIcon.style.color = '#f494cc';
        } else {
            // Icon is in solid state, switch to regular state and remove from watchlist
            heartIcon.classList.remove('fa-solid', 'fa-heart', 'fa-2xl');
            heartIcon.classList.add('fa-regular');
            heartIcon.style.color = '#ffa200';
        }
    }

    // Add event listener to the Font Awesome icon
    heartIcon.addEventListener('click', function () {
        toggleIcon();
        addToWatchlist({
            title: title,
            releaseDate: releaseDate,
            imageUrl: imageUrl,
            tmdbDescription: tmdbDescription,
            imdbDescription: imdbDescription,
            imdbId: imdbId
        }, heartIcon);
    });

    return { movieCard, heartIcon };
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
                var { movieCard } = createMovieCard(
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
function addToWatchlist(movie, heartIcon) {
    // Get the current watchlist data from localStorage or an empty array if it's not set yet
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    // Check if the movie is already in the watchlist
    var movieIndex = watchlist.findIndex(m => m.title === movie.title);

    if (movieIndex === -1) {
        // If movie isn't in watchlist, push it
        watchlist.push(movie);
        // Save the updated watchlist to localStorage
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        // Using a modal to notify user that movie was saved
        Swal.fire('Movie added to watchlist!');

        // Toggle the icon to the solid state and add it to the watchlist
        heartIcon.classList.remove('fa-regular', 'fa-heart', 'fa-2xl');
        heartIcon.classList.add('fa-solid', 'fa-heart', 'fa-2xl');
        heartIcon.style.color = '#f494cc';
    } else {
        // Movie is already in the watchlist, so remove it
        watchlist.splice(movieIndex, 1);
        // Save the updated watchlist to localStorage
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        // Using a modal to notify user that movie was removed
        Swal.fire('Movie removed from watchlist!');
        // Toggle the heartIcon back to its normal state
        heartIcon.classList.remove('fa-solid', 'fa-heart', 'fa-2xl');
        heartIcon.classList.add('fa-regular', 'fa-heart', 'fa-2xl');
        heartIcon.style.color = '#ffa200';
    }
}