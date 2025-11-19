// Script para geolocalização do cliente
document.addEventListener('DOMContentLoaded', function() {
  obterLocalizacaoAutomatica();
});

let enderecoVisivel = false;
let map = null;
let marker = null;
let lastLatitude = null;
let lastLongitude = null;

function initMap(latitude, longitude, popupText) {
  try {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    mapDiv.style.display = 'block';

    if (!window.L) return; // Leaflet não carregado

    if (!map) {
      map = L.map('map').setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(popupText || `Você está aqui: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`).openPopup();
    } else {
      map.setView([latitude, longitude], 13);
      if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(map);
      } else {
        marker.setLatLng([latitude, longitude]);
      }
      if (popupText) marker.bindPopup(popupText).openPopup();
    }

    // Forçar redraw caso o container tenha sido oculto
    setTimeout(() => {
      try { map.invalidateSize(); } catch(e) {}
    }, 200);
  } catch (e) {
    console.log('Erro ao inicializar o mapa:', e);
  }
}

function hideMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;
  try {
    if (map) {
      map.remove();
      map = null;
      marker = null;
    }
  } catch (e) {
    console.log('Erro ao remover mapa:', e);
  }
  mapDiv.style.display = 'none';
}

function obterLocalizacaoAutomatica() {
  const resultadoGeo = document.getElementById('resultadoGeo');
  const erroGeo = document.getElementById('erroGeo');
  const btnGeo = document.getElementById('btnGeolocalizacao');
  
  erroGeo.style.display = 'none';
  
  if (!navigator.geolocation) {
    exibirErro('Geolocalização não é suportada neste navegador.');
    return;
  }
  
  if (btnGeo) {
    btnGeo.style.display = 'none';
  }
  
  const loadingDiv = document.createElement('p');
  loadingDiv.id = 'geoLoading';
  loadingDiv.textContent = '📍 Obtendo sua localização...';
  loadingDiv.style.color = '#fff';
  resultadoGeo.parentElement.insertBefore(loadingDiv, resultadoGeo);
  
  const opcoes = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };
  
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const loading = document.getElementById('geoLoading');
      if (loading) loading.remove();
      
      const coords = position.coords;
      
      // Atualizar dados de localização
      document.getElementById('latitude').textContent = coords.latitude.toFixed(6);
      document.getElementById('longitude').textContent = coords.longitude.toFixed(6);
      
      // Armazenar coordenadas (sem mostrar mapa ainda)
      lastLatitude = coords.latitude;
      lastLongitude = coords.longitude;

      resultadoGeo.style.display = 'block';

      obterEndereco(coords.latitude, coords.longitude);
    },
    function(error) {
      // Remover loading
      const loading = document.getElementById('geoLoading');
      if (loading) loading.remove();
      
      // Se o erro for de permissão, mostrar botão
      if (error.code === error.PERMISSION_DENIED && btnGeo) {
        btnGeo.style.display = 'inline-block';
        btnGeo.addEventListener('click', obterLocalizacao);
      }
      
      let mensagem = '';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          mensagem = 'Permissão negada. Clique no botão para permitir acesso à localização.';
          break;
        case error.POSITION_UNAVAILABLE:
          mensagem = 'Informação de localização não disponível no momento.';
          break;
        case error.TIMEOUT:
          mensagem = 'Tempo limite excedido ao obter a localização.';
          break;
        default:
          mensagem = 'Erro ao obter localização: ' + error.message;
      }
      exibirErro(mensagem);
    },
    opcoes
  );
}

function obterLocalizacao() {
  const resultadoGeo = document.getElementById('resultadoGeo');
  const erroGeo = document.getElementById('erroGeo');
  
  erroGeo.style.display = 'none';
  resultadoGeo.style.display = 'none';
  
  if (!navigator.geolocation) {
    exibirErro('Geolocalização não é suportada neste navegador.');
    return;
  }
  
  const btnGeo = document.getElementById('btnGeolocalizacao');
  const textoOriginal = btnGeo.textContent;
  btnGeo.textContent = 'Carregando localização...';
  btnGeo.disabled = true;
  
  const opcoes = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };
  
  navigator.geolocation.getCurrentPosition(
    function(position) {
      btnGeo.textContent = textoOriginal;
      btnGeo.disabled = false;
      
      const coords = position.coords;
      
      document.getElementById('latitude').textContent = coords.latitude.toFixed(6);
      document.getElementById('longitude').textContent = coords.longitude.toFixed(6);
      
      // Armazenar coordenadas (sem mostrar mapa ainda)
      lastLatitude = coords.latitude;
      lastLongitude = coords.longitude;

      resultadoGeo.style.display = 'block';

      obterEndereco(coords.latitude, coords.longitude);
    },
    function(error) {
      btnGeo.textContent = textoOriginal;
      btnGeo.disabled = false;
      
      let mensagem = '';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          mensagem = 'Permissão negada. Por favor, ative a geolocalização nas configurações do navegador.';
          break;
        case error.POSITION_UNAVAILABLE:
          mensagem = 'Informação de localização não disponível no momento.';
          break;
        case error.TIMEOUT:
          mensagem = 'Tempo limite excedido ao obter a localização.';
          break;
        default:
          mensagem = 'Erro ao obter localização: ' + error.message;
      }
      exibirErro(mensagem);
    },
    opcoes
  );
}

function exibirErro(mensagem) {
  const erroGeo = document.getElementById('erroGeo');
  erroGeo.textContent = '⚠️ ' + mensagem;
  erroGeo.style.display = 'block';
}

function obterEndereco(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  
  fetch(url, {
    headers: {
      'Accept-Language': 'pt-BR'
    }
  })
  .then(response => response.json())
  .then(data => {
    const endereco = data.address || {};
    
    let enderecoTexto = '';
    
    if (endereco.city) enderecoTexto += endereco.city;
    if (endereco.state) enderecoTexto += ', ' + endereco.state;
    if (endereco.country) enderecoTexto += ', ' + endereco.country;
    
    if (enderecoTexto) {
      const enderecoParagrafo = document.getElementById('endereco');
      const enderecoSpan = document.getElementById('enderecotexto');
      
      enderecoSpan.dataset.endereco = enderecoTexto;
      enderecoSpan.textContent = '[Clique para revelar]';
      enderecoSpan.style.cursor = 'pointer';
      enderecoSpan.style.color = '#ff9900';
      enderecoSpan.style.textDecoration = 'underline';
      enderecoSpan.style.fontWeight = 'bold';
      
      enderecoSpan.addEventListener('click', function(e) {
        e.stopPropagation();
        enderecoVisivel = !enderecoVisivel;

        if (enderecoVisivel) {
          this.textContent = enderecoTexto;
          this.style.color = '#667eea';

          // Mostrar mapa quando o usuário revelar o endereço
          if (lastLatitude !== null && lastLongitude !== null) {
            initMap(lastLatitude, lastLongitude, `${enderecoTexto}<br>Lat: ${lastLatitude.toFixed(6)}, Lon: ${lastLongitude.toFixed(6)}`);
          }
        } else {
          this.textContent = '[Clique para revelar]';
          this.style.color = '#ff9900';

          // Ocultar mapa quando o usuário esconder o endereço
          hideMap();
        }
      });

      if (marker) {
        const popupContent = `${enderecoTexto}<br>Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
        marker.bindPopup(popupContent).openPopup();
      }
    } else {
      document.getElementById('enderecotexto').textContent = 'Localização desconhecida';
    }
  })
  .catch(error => {
    console.log('Erro ao obter endereço:', error);
    document.getElementById('enderecotexto').textContent = 'Não foi possível obter o endereço';
    document.getElementById('endereco').style.display = 'none';
  });
}
