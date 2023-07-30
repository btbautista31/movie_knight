// Function to display the user's watchlist movies as movie cards
function displayWatchlist() {
    var watchlistContainer = document.getElementById('watchlistContainer');
    watchlistContainer.innerHTML = '';

    // Get the watchlist data from localStorage or an empty array if it's not set yet
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<p>Your watchlist is empty.</p>';
    } else {
        for (var i = 0; i < watchlist.length; i++) {
            var movie = watchlist[i];
            // Check if all the necessary properties are present to avoid displaying incomplete data
            if (movie.title && movie.releaseDate && movie.imageUrl) {
                // Create a new watchlist card element and pass the index
                var watchlistCard = createWatchlistCard(
                    movie.title,
                    movie.releaseDate,
                    movie.imageUrl,
                    movie.imdbDescription,
                    movie.tmdbDescription,
                    movie.imdbId,
                    i // Pass the index of the movie in the watchlist array
                );

                // Append the watchlist card to the watchlist container
                watchlistContainer.appendChild(watchlistCard);
            }
        }
    }
}

function createWatchlistCard(title, releaseDate, imageUrl, imdbDescription, tmdbDescription, imdbId, index) {
    // Create the main container for the watchlist card
    var cardContainer = document.createElement('div');
    cardContainer.classList.add('watchlist-card');
    cardContainer.style.display = 'flex';
    cardContainer.style.alignItems = 'center';
    cardContainer.style.justifyContent = 'center';
    cardContainer.style.background = '#5c5c5c';
    cardContainer.style.borderRadius = '10px';
    cardContainer.style.padding = '10px';

    // Create the poster section for the movie image
    var posterSection = document.createElement('div');
    posterSection.classList.add('poster-section');

    // Create the movie image element
    var movieImage = document.createElement('img');
    movieImage.src = `https://image.tmdb.org/t/p/w185/${imageUrl}`;
    movieImage.alt = title;
    movieImage.classList.add('movie-image'); // Add a class to the movie image element
    posterSection.appendChild(movieImage);
    
    // Create the info section for movie details
    var infoSection = document.createElement('div');
    infoSection.classList.add('info-section');

    // Create the movie title element
    var movieTitle = document.createElement('h2');
    movieTitle.textContent = title;
    movieTitle.classList.add('movie-title');
    infoSection.appendChild(movieTitle);

    // Create a flex container for the info section (to place IMDb image and delete button in a line)
    var infoFlexContainer = document.createElement('div');
    infoFlexContainer.style.display = 'flex';
    infoFlexContainer.style.flexDirection = 'column';
    infoFlexContainer.style.alignItems = 'center'; // Center contents horizontally

    if (imdbId) {
        // Creating the IMDb logo image element
        var imdbLogoImg = document.createElement('img');
        imdbLogoImg.src = './assets/images/imdb.png';
        imdbLogoImg.alt = 'IMDb';
        imdbLogoImg.style.width = '80px';
        imdbLogoImg.style.height = 'auto';
        imdbLogoImg.style.borderRadius = '8px';
        imdbLogoImg.style.transform = 'scale(1.0)';

        // Creating the IMDb link element
        var imdbLink = `https://www.imdb.com/title/${imdbId}`;
        var imdbLinkElement = document.createElement('a');
        imdbLinkElement.href = imdbLink;
        imdbLinkElement.target = '_blank';
        imdbLinkElement.appendChild(imdbLogoImg);

        // Append the IMDb link element to the flex container
        infoFlexContainer.appendChild(imdbLinkElement);

        // Creating a mouseover effect that makes the imdbLogoImg slightly larger when hovered over
        imdbLinkElement.addEventListener('mouseover', function () {
            imdbLogoImg.style.transition = 'transform 0.2s ease';
            imdbLogoImg.style.transform = 'scale(1.1)';
        });

        imdbLinkElement.addEventListener('mouseout', function () {
            imdbLogoImg.style.transition = 'transform 0.2s ease';
            imdbLogoImg.style.transform = 'scale(1.0)';
        });
    }

    // Create the delete button for the movie card
    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-x" style="color: #ff6b01;"></i>';
    deleteButton.classList.add('delete-button');
    deleteButton.style.background = 'none';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '2px';
    deleteButton.style.cursor = 'pointer';

    // Add an event listener to the delete button
    deleteButton.addEventListener('click', function () {
        // Get the index of the movie in the watchlist array
        var index = this.dataset.index;
        removeMovieFromWatchlist(index);
    });

    // Set the index of the movie as a data attribute on the delete button
    deleteButton.dataset.index = index;

    // Append the delete button to the flex container
    infoFlexContainer.appendChild(deleteButton);

    // Append the flex container (with IMDb image and delete button) to the info section
    infoSection.appendChild(infoFlexContainer);

    // Append the poster and info sections to the card container
    cardContainer.appendChild(posterSection);
    cardContainer.appendChild(infoSection);

    return cardContainer;
}


// Function to remove a movie from the watchlist
function removeMovieFromWatchlist(index) {
    var watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (index >= 0 && index < watchlist.length) {
        // Remove the movie from the watchlist array based on the index
        watchlist.splice(index, 1);
        // Update the watchlist in localStorage
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        // Update the display
        displayWatchlist();
    }
}

// Function to handle changes in localStorage
function handleLocalStorageChange(event) {
    if (event.key === 'watchlist') {
        // If the 'watchlist' key is changed in localStorage, update the watchlist display
        displayWatchlist();
    }
}

// Add event listener for changes in localStorage
window.addEventListener('storage', handleLocalStorageChange);

// Call the displayWatchlist function to show the user's watchlist movies on page load
displayWatchlist();