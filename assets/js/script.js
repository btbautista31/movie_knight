const settings = {
	async: true,
	crossDomain: true,
	url: 'https://imdb-search2.p.rapidapi.com/oppenheimer',
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '249f566bbdmsh5a8a690f2cf015ap1db355jsn44e4a97a11da',
		'X-RapidAPI-Host': 'imdb-search2.p.rapidapi.com'
	}
};

$.ajax(settings).done(function (response) {
	console.log(response);
});