const publicKey = '463f742b8131b4373817e179bf367851';
const privateKey = 'cb46230f3b9589a61adeb158d5ea10d577827d6f';
const baseUrl = 'https://gateway.marvel.com/v1/public/characters';
const characterList = $('#character-list');
const pagination = $('#pagination');
const searchInput = $('#search');
let currentPage = 1;

function generateHash(ts, privateKey, publicKey) {
  return CryptoJS.MD5(ts + privateKey + publicKey).toString();
}

async function fetchCharacters(query = '', page = 1) {
  const ts = new Date().getTime();
  const hash = generateHash(ts, privateKey, publicKey);
  const limit = 20;
  const offset = (page - 1) * limit;

  let url = `${baseUrl}?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}`;
  if (query) {
    url += `&nameStartsWith=${query}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
}

function renderCharacters(characters) {
  characterList.empty();
  characters.forEach(character => {
    characterList.append(`
      <div class="col-md-3 mb-4">
        <div class="card bg-dark">
          <img src="${character.thumbnail.path}.${character.thumbnail.extension}" class="card-img-top" alt="${character.name}">
          <div class="card-body">
            <h5 class="card-title text-light">${character.name}</h5>
            <a href="character.html?id=${character.id}" class="btn btn-primary">View Details</a>
          </div>
        </div>
      </div>
    `);
  });
}

function renderPagination(total, limit) {
  pagination.empty();
  const totalPages = Math.ceil(total / limit);
  const visiblePages = 18;
  let startPage = currentPage - Math.floor(visiblePages / 2);
  startPage = Math.max(startPage, 1);
  let endPage = startPage + visiblePages - 1;
  endPage = Math.min(endPage, totalPages);

  if (endPage - startPage < visiblePages - 1) {
    startPage = Math.max(endPage - visiblePages + 1, 1);
  }

  if (startPage > 1) {
    pagination.append(`<li class="page-item">
    <a class="page-link" href="#" data-page="1">&laquo; 1</a>
    </li>`);
  }

  for (let i = startPage; i <= endPage; i++) {
    pagination.append(`
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `);
  }

  if (endPage < totalPages) {
    pagination.append(`<li class="page-item">
    <a class="page-link" href="#" data-page="${totalPages}">${totalPages} &raquo;</a>
    </li>`);
  }
}

async function loadCharacters(query = '', page = 1) {
  const data = await fetchCharacters(query, page);
  if (data) {
    renderCharacters(data.results);
    renderPagination(data.total, data.limit);
  }
}

$(document).on('click', '.page-link', function(e) {
  e.preventDefault();
  currentPage = parseInt($(this).data('page'));
  loadCharacters(searchInput.val(), currentPage);
});

searchInput.on('keyup', function() {
  loadCharacters($(this).val());
});

// Initial load
loadCharacters();
