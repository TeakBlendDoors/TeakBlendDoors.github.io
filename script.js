const serials = [
  ...Array.from({ length: 19 }, (_, i) => `vmk${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 9 }, (_, i) => `vmk10${i + 1}`)
];

let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const gallery = document.querySelector('.gallery');
  const searchInput = document.getElementById('searchInput');

  if (!gallery || !searchInput || !imageModal || !modalImage || !prevBtn || !nextBtn) {
    console.error('One or more required DOM elements are missing.');
    return;
  }

  function showImage() {
    const serial = serials[currentIndex];
    modalImage.onerror = () => {
      modalImage.src = 'fallback.webp';
    };
    modalImage.src = `https://ik.imagekit.io/TeakBlendDoors/${serial}.webp`;
    history.replaceState(null, '', `#${serial}`);
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + serials.length) % serials.length;
    showImage();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % serials.length;
    showImage();
  });

  imageModal.addEventListener('show.bs.modal', event => {
    const triggerImg = event.relatedTarget;
    if (triggerImg && triggerImg.hasAttribute('data-index')) {
      currentIndex = parseInt(triggerImg.getAttribute('data-index'), 10);
      if (!isNaN(currentIndex)) {
        showImage();
      }
    }
  });

  imageModal.addEventListener('hidden.bs.modal', () => {
    history.replaceState(null, '', window.location.pathname);
  });

  function loadImageFromHash() {
    const hash = window.location.hash.substring(1);
    if (serials.includes(hash)) {
      currentIndex = serials.indexOf(hash);
      showImage();
      const modal = new bootstrap.Modal(imageModal);
      modal.show();
    }
  }

  const getFirstRowCount = () => {
    const width = window.innerWidth;
    if (width < 576) return 2;
    if (width < 768) return 3;
    return 4;
  };

  function updateGallery(filteredSerials) {
    gallery.innerHTML = '';
    const firstRowCount = getFirstRowCount();

    filteredSerials.forEach((serial, index) => {
      const col = document.createElement('div');
      col.className = 'img-container col-12 col-sm-6 col-md-4 col-lg-3 mb-4';

      const wrapper = document.createElement('div');
      wrapper.classList.add('rounded');
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', `Preview of ${serial}`);
      wrapper.dataset.index = index;

      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          currentIndex = index;
          showImage();
          const modal = new bootstrap.Modal(imageModal);
          modal.show();
        }
      });

      const img = document.createElement('img');
      img.alt = serial;
      img.dataset.bsToggle = 'modal';
      img.dataset.bsTarget = '#imageModal';
      img.dataset.index = index;
      img.onerror = () => { img.src = 'fallback.webp'; };
      img.src = `https://ik.imagekit.io/TeakBlendDoors/${serial}.webp`;

      if (index >= firstRowCount) {
        img.loading = 'lazy';
      }

      wrapper.appendChild(img);
      col.appendChild(wrapper);
      gallery.appendChild(col);
    });
  }

  updateGallery(serials);

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSerials = serials.filter(serial => serial.includes(searchTerm));
    updateGallery(filteredSerials);
  });

  loadImageFromHash();

  document.addEventListener('keydown', (e) => {
    if (imageModal.classList.contains('show')) {
      if (e.key === 'ArrowLeft') {
        prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        nextBtn.click();
      }
    }
  });

  // 👇 Smart touch handling inside modal
  let isModalOpen = false;
  let startY = 0;

  imageModal.addEventListener('show.bs.modal', () => {
    isModalOpen = true;
  });

  imageModal.addEventListener('hidden.bs.modal', () => {
    isModalOpen = false;
  });

  imageModal.addEventListener('touchstart', function (e) {
    if (!isModalOpen) return;

    if (e.touches.length === 1) {
      startY = e.touches[0].clientY;
    }
  }, { passive: false });

  imageModal.addEventListener('touchmove', function (e) {
    if (!isModalOpen) return;

    if (e.touches.length === 1) {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(currentY - startY);

      if (deltaY > 10) {
        // Prevent vertical scroll while allowing horizontal swipe
        e.preventDefault();
      }
    }
    // Multi-touch (pinch): do nothing, allow zoom
  }, { passive: false });

});
