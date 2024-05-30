const publicKey = '463f742b8131b4373817e179bf367851';
const privateKey = 'cb46230f3b9589a61adeb158d5ea10d577827d6f';
const baseUrl = 'https://gateway.marvel.com/v1/public/characters';
const characterDetails = $('#character-details');
const urlParams = new URLSearchParams(window.location.search);
const characterId = urlParams.get('id');

function generateHash(ts, privateKey, publicKey) {
  return CryptoJS.MD5(ts + privateKey + publicKey).toString();
}

async function fetchCharacterDetails(characterId) {
  const ts = new Date().getTime();
  const hash = generateHash(ts, privateKey, publicKey);
  const url = `${baseUrl}/${characterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data.results[0];
  } catch (error) {
    console.error('Error fetching character details:', error);
  }
}

function renderCharacterDetails(character) {
  characterDetails.empty();
  characterDetails.append(`
    <div class="row bg-secondary">
      <div class="col-md-4">
        <img src="${character.thumbnail.path}.${character.thumbnail.extension}" class="img-fluid" alt="${character.name}">
      </div>
      <div class="col-md-8">
        <h1 class="text-light">${character.name}</h1>
        <p class="text-light">${character.description}</p>
        <h3 class="text-light">Informacion Adicional:</h3>
        <p class="text-light">Comics: ${character.comics.available}</p>
        <p class="text-light">Series: ${character.series.available}</p>
        <p class="text-light">Events: ${character.events.available}</p>
        <p class="text-light">Stories: ${character.stories.available}</p>
      </div>
    </div>
  `);
}

async function loadCharacterDetails(characterId) {
  const character = await fetchCharacterDetails(characterId);
  renderCharacterDetails(character);
}

if (characterId) {
  loadCharacterDetails(characterId);
}
