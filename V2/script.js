document.addEventListener('DOMContentLoaded', () => {
    // 1. Dades d’imatges
    const imatges = [
        { nom: "amanida", categoria: "d", ruta: "../imatges/d/amanida.png" },
        { nom: "banyador", categoria: "d", ruta: "../imatges/d/banyador.png" },
        { nom: "cadena", categoria: "d", ruta: "../imatges/d/cadena.png" },
        { nom: "dau", categoria: "d", ruta: "../imatges/d/dau.svg" },
        { nom: "davantal", categoria: "d", ruta: "../imatges/d/davantal.png" },
        { nom: "dit", categoria: "d", ruta: "../imatges/d/dit.png" },
        { nom: "dutxa", categoria: "d", ruta: "../imatges/d/dutxa.png" },
        { nom: "dent", categoria: "d", ruta: "../imatges/d/dent.png" },
        { nom: "dinar", categoria: "d", ruta: "../imatges/d/dinar.png" },
        { nom: "dofi", categoria: "d", ruta: "../imatges/d/dofi.png" },
        { nom: "nedar", categoria: "d", ruta: "../imatges/d/nedar.png" },
        { nom: "adeu", categoria: "d", ruta: "../imatges/d/adeu.png" },
        { nom: "medusa", categoria: "d", ruta: "../imatges/d/medusa.png" },

        { nom: "balena", categoria: "l", ruta: "../imatges/l/balena.png" },
        { nom: "colze", categoria: "l", ruta: "../imatges/l/colze.png" },
        { nom: "galeta", categoria: "l", ruta: "../imatges/l/galeta.png" },
        { nom: "lavabo", categoria: "l", ruta: "../imatges/l/lavabo.png" },
        { nom: "lupa", categoria: "l", ruta: "../imatges/l/lupa.png" },
        { nom: "melo", categoria: "l", ruta: "../imatges/l/melo.png" },
        { nom: "pala", categoria: "l", ruta: "../imatges/l/pala.png" },
        { nom: "pilota", categoria: "l", ruta: "../imatges/l/pilota.png" },
        { nom: "plàtan", categoria: "l", ruta: "../imatges/l/platan.png" },
        { nom: "pantalo", categoria: "l", ruta: "../imatges/l/pantalo.png" },
        { nom: "taula", categoria: "l", ruta: "../imatges/l/taula.png" },
        { nom: "paleta", categoria: "l", ruta: "../imatges/l/paleta.png" },

        { nom: "cara", categoria: "r", ruta: "../imatges/r/cara.png" },
        { nom: "caramel", categoria: "r", ruta: "../imatges/r/caramel.png" },
        { nom: "cargol", categoria: "r", ruta: "../imatges/r/cargol.png" },
        { nom: "cinturo", categoria: "r", ruta: "../imatges/r/cinturo.png" },
        { nom: "fruita", categoria: "r", ruta: "../imatges/r/fruita.png" },
        { nom: "pare", categoria: "r", ruta: "../imatges/r/pare.png" },
        { nom: "mare", categoria: "r", ruta: "../imatges/r/mare.png" },
        { nom: "para-sol", categoria: "r", ruta: "../imatges/r/para-sol.png" },
        { nom: "mirar", categoria: "r", ruta: "../imatges/r/mirar.png" },
        { nom: "cirera", categoria: "r", ruta: "../imatges/r/cirera.png" },
        { nom: "camera", categoria: "r", ruta: "../imatges/r/camera.png" },
        { nom: "erico", categoria: "r", ruta: "../imatges/r/erico.png" },
        { nom: "toro", categoria: "r", ruta: "../imatges/r/toro.png" }
    ];
  
    // 2. Sons
    const errorSound = new Audio('../sons/error.mp3');
    const bloopSound = new Audio('../sons/bloop.mp3');
  
    // 3. Elements del DOM
    const imageStack = document.querySelector('.image-stack');
    const dropZones = document.querySelectorAll('.drop-zone');
  
    // 4. Estat del joc
    let shuffledImages = [];
    let currentImageIndex = 0;
  
    // 5. Barrejador Fisher-Yates
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ array[i], array[j] ] = [ array[j], array[i] ];
      }
      return array;
    }
  
    // 6. Mostra la següent imatge a la pila
    function displayNextImage() {
      imageStack.innerHTML = '';
      if (currentImageIndex >= shuffledImages.length) {
        const msg = document.createElement('p');
        msg.textContent = "Ja hem acabat! Molt bé!";
        msg.classList.add('game-over-message');
        imageStack.appendChild(msg);
        return;
      }
      const data = shuffledImages[currentImageIndex];
      const img  = document.createElement('img');
      img.src    = data.ruta;
      img.alt    = data.nom;
      img.classList.add('draggable-image');
      img.draggable = true;
      img.dataset.category = data.categoria;
  
      // events escriptori
      img.addEventListener('dragstart', handleDragStart);
  
      // events mòbil
      img.addEventListener('touchstart', handleTouchStart, { passive: false });
  
      imageStack.appendChild(img);
    }
  
    // 7. Drag&Drop per escriptori
    function handleDragStart(e) {
      const img = e.target;
      e.dataTransfer.setData('text/plain', img.dataset.category);
      const ox = img.offsetWidth / 2, oy = img.offsetHeight / 2;
      e.dataTransfer.setDragImage(img, ox, oy);
    }
    function handleDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }
    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }
    function handleDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      const zoneCat = e.currentTarget.dataset.category;
      const imgEl   = imageStack.querySelector('.draggable-image');
      if (imgEl && imgEl.dataset.category === zoneCat) {
        bloopSound.play();
        placeImage(imgEl, e.currentTarget);
      } else {
        errorSound.play();
      }
    }
  
    // 8. Drag&Drop per mòbil (touch)
    let touchDragEl = null, touchOffsetX = 0, touchOffsetY = 0;
  
    function handleTouchStart(e) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const img   = e.currentTarget;
  
      // Clona i prepara l’element flotant
      touchDragEl = img.cloneNode(true);
      Object.assign(touchDragEl.style, {
        position: 'absolute', pointerEvents: 'none',
        width: img.offsetWidth + 'px',
        height: img.offsetHeight + 'px',
      });
      document.body.appendChild(touchDragEl);
  
      // Calcula offsets
      const rect = img.getBoundingClientRect();
      touchOffsetX = touch.clientX - rect.left;
      touchOffsetY = touch.clientY - rect.top;
  
      moveTouchImage(touch.clientX, touch.clientY);
  
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
  
    function handleTouchMove(e) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      moveTouchImage(touch.clientX, touch.clientY);
    }
  
    function moveTouchImage(x, y) {
      touchDragEl.style.left = (x - touchOffsetX) + 'px';
      touchDragEl.style.top  = (y - touchOffsetY) + 'px';
    }
  
    function handleTouchEnd(e) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      // Detecta la zona sota el dit
      const zoneEl = document.elementFromPoint(touch.clientX, touch.clientY)
                            ?.closest('.drop-zone');
      if (zoneEl) {
        const imgEl = imageStack.querySelector('.draggable-image');
        if (imgEl && imgEl.dataset.category === zoneEl.dataset.category) {
          bloopSound.play();
          placeImage(imgEl, zoneEl);
        } else {
          errorSound.play();
        }
      }
      // Neteja
      touchDragEl.remove();
      touchDragEl = null;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
  
    // 9. Col·loca la imatge i passa a la següent
    function placeImage(imgEl, zoneEl) {
      imgEl.draggable = false;
      imgEl.classList.remove('draggable-image');
      zoneEl.querySelector('.dropped-images').appendChild(imgEl);
      currentImageIndex++;
      displayNextImage();
    }
  
    // 10. Enllaça zones
    dropZones.forEach(z => {
      z.addEventListener('dragover', handleDragOver);
      z.addEventListener('dragleave', handleDragLeave);
      z.addEventListener('drop', handleDrop);
    });
  
    // 11. Inicialitza
    shuffledImages = shuffleArray([...imatges]);
    displayNextImage();
  });
  