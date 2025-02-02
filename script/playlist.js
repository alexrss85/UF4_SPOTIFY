import { clientId,clientSecret } from "../env/env.js";

//CONSTANTS
const playlists = document.querySelector("#playlists");
const cancons = document.querySelector("#cancons");
const seleccionades = document.querySelector("#seleccionades");
const botoTornar = document.querySelector("#botoTornar")
const divTracks = document.querySelector("#divTracks")
const divLlistes = document.querySelector("#divLlistes")
const seleccionarLlista =  document.querySelectorAll(".playlist")
const inputLlista = document.querySelector("#inputLlista")
const botoGuardarNom = document.querySelector("#botoGuardarNom")
const playlistTracks = document.querySelector("#playlistTracks")

//VARIABLES
let token = "";
let trackIds = localStorage.getItem("cançonsSeleccionades").split(';')
let user_id;
let llistaSeleccionada;
let playlist_id;
let trackUri;
let canco_id;

//EVENTS
botoTornar.addEventListener("click", () => {
    window.location.assign("index.html");
});


botoGuardarNom.addEventListener("click", () => {
  if(llistaSeleccionada){
    if(window.confirm(`Vols modificar el nom de la llista a '${inputLlista.value}'?`)){
      llistaSeleccionada.innerHTML=`<h3>${inputLlista.value}</h3>`
    }
  }
});



//TOKEN
function getToken() {
    token = window.location.href.split("access_token=")[1];
}
getToken()


//PLAYLISTS

    // USER ID
const getUser = async function () {
  const url = "https://api.spotify.com/v1/me";


  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data) {
      user_id=data.id;
      llistes()
    } else {
      console.log("No hi ha usuari");
    }
  } catch (error) {
    console.error("Error en obtenir l'usuari:", error);
  }
};

    //Llistes del usuari
const llistes = async function(){

  const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if(response){
    let data = await response.json();
    
    data = data.items
    renderitzarLlistes(data)
}
}

  //render de les llistes del usuari
function renderitzarLlistes(data){
  divLlistes.textContent = "";
  for(let i = 0; i < data.length; i++){
    const objDiv = document.createElement("div");
    objDiv.className="playlist";
    objDiv.innerHTML=`<h3>${data[i].name}</h3>`  
    let nomLlista = objDiv.innerText
    objDiv.addEventListener("click",() => {
      inputLlista.value = nomLlista
      llistaSeleccionada=objDiv
      console.log(llistaSeleccionada)
      playlist_id=data[i].id
      getPlaylistItems()
    });    

    divLlistes.appendChild(objDiv)  
    
    
  }
}


//CANÇONS


    //PETICIÓ CANÇONS D'UNA PLAYLIST

async function getPlaylistItems() {

  const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
      
  const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
  if(response){
    let data = await response.json();
    data= data.items

    // RENDER TRACKS
    renderitzarPlaylistTracks(data)
  }
                                                   
}



    //RENDER DE LES CANÇONS D'UNA PLAYLIST

function renderitzarPlaylistTracks(data){
  playlistTracks.textContent = "";
  for(let i = 0; i < data.length; i++){
    const objDiv = document.createElement("div");
    objDiv.className="track";
    objDiv.innerHTML=`<div class="imgTrack"><img src="${data[i].track.album.images[0].url}"></div>
                      <h3>${data[i].track.name}</h3>
                      <h4>${data[i].track.artists[0].name}</h4>
                      <p>${data[i].added_at}</p>
                      <button class="delete_fromPlaylist">DEL</button>`   

    //borrar de la playlist
     const delete_fromPlaylist= objDiv.querySelector(".delete_fromPlaylist")
       delete_fromPlaylist.addEventListener("click", () => { 
          if(window.confirm(`Estàs segur que vols eliminar la cançó de la playlist?`)){
            //guardem uri cançó
            trackUri=data[i].track.uri
            deleteFromPlaylist()
            objDiv.remove()
          }
        });

        playlistTracks.appendChild(objDiv) 
  }
}



    //BORRAR DE LA PLAYLIST

async function deleteFromPlaylist(){

  const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tracks: [{ uri: trackUri }] // Afegir la URIs que volem eliminar
    })
  });
}


//SLECCIONADES


      //AGAFA CANÇONS DE SPOTIFY SEGONS ELS IDs DE LES NOSTRES GUARDADES
async function agafarCancons(){

    const url = `https://api.spotify.com/v1/tracks?ids=${trackIds.join(",")}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if(response){
        let data = await response.json();
        data=data.tracks
        renderitzarTracks(data)
    }

}


      //RENDER DELS TRACKS GUARDATS AL LOCAL STORAGE
function renderitzarTracks(data){
    divTracks.textContent = "";
    for(let i = 0; i < data.length; i++){
      const objDiv = document.createElement("div");
      objDiv.className="track";
      objDiv.innerHTML=`<div class="imgTrack"><img src="${data[i].album.images[0].url}"></div>
                        <h3>${data[i].name}</h3>
                        <h4>${data[i].artists[0].name}</h4>
                        <button class="botoAfegirCanco">ADD</button>
                        <button class="botoBorrarCanco">DEL</button>`   
             
       //AFEGIR FUNCIO AL BOTO BORRAR
       const borrarCanco = objDiv.querySelector(".botoBorrarCanco")
       borrarCanco.addEventListener("click", () => { 
      if(window.confirm(`Estàs segur que vols eliminar la cançó de la llista de cançons guardades?`)){
        eliminarCanco(i,data,objDiv)
      }
});



      // AFEGIR CANÇO A LA PLAYLIST
       const afegirCanco = objDiv.querySelector(".botoAfegirCanco")
       afegirCanco.addEventListener("click", async() => { 
          trackUri = data[i].uri
        
          //controlem que hi hagi llista seleccionada
          if(llistaSeleccionada){
            if (window.confirm(`Estàs segur que vols afegir la cançó a la playlist: '${llistaSeleccionada.querySelector("h3").innerText}'?`)) {
              await addToPlaylist();  
              eliminarCanco(i, data, objDiv);
              await getPlaylistItems(); 
          }
          }else{
            alert("Selecciona una playlist")
          }
        });

        divTracks.appendChild(objDiv) 
    }

  }


    //BORRA CANÇO DE LES SELECCIONADES
function eliminarCanco(i,data,objDiv){
  let idBorrar = trackIds.indexOf(data[i].id)
  trackIds.splice(idBorrar,1)
  localStorage.setItem("cançonsSeleccionades", trackIds.join(";"));
  objDiv.remove()
  if(trackIds.length<1){
    divTracks.innerText="No hi ha cap canço seleccionada."
  }
}


    //AFEGEIX CANÇO A LA PLAYLIST
async function addToPlaylist() {

    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
      
    const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uris: [trackUri], // Afegir la llista de URIs que volem afegir
          }),
        });
}
  


agafarCancons()
getUser()

