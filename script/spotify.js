import { clientId,clientSecret } from "../script/client.js";

let tokenAccess = ""
let llista;
let resultats;
let artistId;
let cancoID;
let artistUrl;
let llistaTops;
let nomCanco;
let llistaIDS=[]
let i=0
let tracksRenderitzats=12
const botoBuscar = document.querySelector(".buscar");
const botoBorrar = document.querySelector(".borrar");
const inputNom = document.querySelector("input");
const musica = document.querySelector("#musica")
const artista = document.querySelector(".infoArtista");
const divArtista = document.querySelector("#infoCanco");
const topTracks = document.querySelector(".llistaCancons");



botoBorrar.disabled=true
botoBuscar.disabled=true



botoBuscar.addEventListener("click", () => {
  cercarCanco()
});

botoBorrar.addEventListener("click", () => {
  resetCerca()
});


function cercarCanco(){
  nomCanco= inputNom.value
  if(nomCanco){
    if(nomCanco.length>=2){
      searchSpotifyTracks(nomCanco)
    }else{
      alert("Has d’introduir almenys 2 caràcters")
    }
  }else{
    alert("Introdueix el nom de la canço...")
  }
}

function resetCerca() {
  inputNom.value = "";
  musica.innerHTML = `<div id="musica">Fes una nova busqueda</div>`;

  document.querySelector(".infoArtista").textContent = "Informació artista";
  document.querySelector(".llistaCancons").textContent = "LLista de Cançons";

  tracksRenderitzats=12
}



const infoArtista = function () {
  
 artistUrl = `https://api.spotify.com/v1/artists/${artistId}`;

 const artista = document.querySelector(".infoArtista");
 const topTracks = document.querySelector(".llistaCancons");

  fetch(artistUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenAccess}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      renderitzarArtista(data)
      getTopTracks()
    })

};




const renderitzarTracks = function(llista){
  musica.textContent = "";
  for(let i = 0; i < llista.length; i++){
    const objDiv = document.createElement("div");
    objDiv.className="track";
    objDiv.innerHTML=`<div class="divImg"><img src=${llista[i].album.images[0].url} class="img"/> </div>
                     <h2 class="titol">${llista[i].name}</h2>
                     <div class="artista">Artista : ${llista[i].artists[0].name}</div>
                     <div class="album">Àlbum: ${llista[i].album.name}</div>
                     <button class="botoAfegir"> + Afegir Cançó</button>`;
              
    objDiv.addEventListener("click", function(){
      artistId = llista[i].artists[0].id
      cancoID = llista[i].id
      if(!llistaIDS.includes(cancoID)){
        llistaIDS.push(cancoID);
      }
      localStorage.setItem("cançonsSeleccionades", llistaIDS.join(";"));
      infoArtista();
    })

    musica.appendChild(objDiv);
  }

  //BOTO AFEGIR + RESULTATS
  const carregarMes = document.createElement("button")
  carregarMes.textContent= "+ Cançons ("+tracksRenderitzats+" de "+resultats+")";
  carregarMes.addEventListener("click", () => {
    mesResultats()
  });
  musica.appendChild(carregarMes)
}


const getTopTracks = function () {
  const tracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=ES`; 
  const header = {
    Authorization: `Bearer ${tokenAccess}`,
    "Content-Type": "application/json",
  };

  fetch(tracksUrl, { method: "GET", headers: header })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      llistaTops=data.tracks
      renderTopTracks(llistaTops);
    })

};


function renderTopTracks(llistaTops){
  topTracks.innerHTML=`
  <h2>TOP HITS</h2>
  <ol>
    <li>${llistaTops[0].name}</li>
    <li>${llistaTops[1].name}</li>
    <li>${llistaTops[2].name}</li>
  </ol>`
}



    const searchSpotifyTracks = function (query, accessToken) {
  // Definim l’endpoint, la query és el valor de búsqueda.
  // Limitem la búsqueda a cançons i retornarà 12 resultats.
  const searchUrl =
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`;
    

      // Al headers sempre s’ha de posar la mateixa informació.
    fetch(searchUrl, {
        method: "GET",
        headers: {
        Authorization: `Bearer ${tokenAccess}`,
        "Content-Type": "application/json",
        },
    })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.tracks.items.length > 0) {
            llista = data.tracks.items;
            resultats = llista.length
            renderitzarTracks(llista.slice(0,12))
          }else{
            musica.innerHTML = "No hi han resultats...";
          }           
        })


};


const mesResultats = function() {
  let i=0
  if(tracksRenderitzats+12<=50){
    tracksRenderitzats+=12
  }else{
    tracksRenderitzats=50
  }
  renderitzarTracks(llista.slice(i,tracksRenderitzats));
}


const getSpotifyAccessToken = function (clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    // Url de l'endpont de spotify
    const url = "https://accounts.spotify.com/api/token";
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const header = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  

    fetch(url, {
      method: "POST",
      headers: header,
      body: "grant_type=client_credentials", 
    })
      .then((response) => {

        return response.json(); 
      })
      .then((data) => {
        tokenAccess = data.access_token;
        resolve(tokenAccess); 
      })

      .catch((error) => {
        console.error("Error a l'obtenir el token:", error);
        reject(`Error al obtener el token: ${error}`);
      });
    });
    
  };
  

  



function renderitzarArtista(data){
  artista.innerHTML= `<div class="artista-img"><img class= "imgArtista" src=${data.images[0].url} class="img"/></div>
                      <h2>${data.name}</h2>
                      <p>Popularitat: ${data.popularity}</p>
                      <p>Generes: ${data.genres[0]}</p>
                      <p>Seguidors: ${data.followers.total}</p>`
}


getSpotifyAccessToken(clientId, clientSecret).then(() => {
  botoBorrar.disabled=false
  botoBuscar.disabled=false
})