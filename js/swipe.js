/**
 * ============================================================
 * THE COURT — Swipe-to-Delete Utility
 * ============================================================
 * Apple-style swipe per eliminare. Funziona su touch e mouse.
 *
 * Uso: initSwipe(wrapper, contentEl, onDelete)
 *   - wrapper:   l'elemento contenitore (.swipe-wrapper)
 *   - contentEl: il contenuto che scorre (.swipe-content)
 *   - onDelete:  callback quando l'elemento viene eliminato
 * ============================================================
 */

function initSwipe(wrapper, contentEl, onDelete) {
  const THRESHOLD = 0.30;  // 30% della larghezza = delete
  const ACTION_WIDTH = 72; // larghezza zona delete

  // Crea azione delete
  const action = document.createElement('div');
  action.className = 'swipe-action';
  action.innerHTML = '<div class="swipe-delete-circle">🗑️</div>';
  wrapper.insertBefore(action, contentEl);

  let startX = 0, currentDx = 0, isDragging = false, isAnimating = false;

  function onStart(clientX) {
    if (isAnimating) return;
    startX = clientX;
    currentDx = 0;
    isDragging = true;
    contentEl.style.transition = 'none';
    action.style.transition = 'none';
  }

  function onMove(clientX) {
    if (!isDragging || isAnimating) return;
    currentDx = Math.min(0, clientX - startX);

    // Resistance dopo ACTION_WIDTH
    const absDx = Math.abs(currentDx);
    let visualDx;
    if (absDx <= ACTION_WIDTH) {
      visualDx = currentDx;
    } else {
      visualDx = -(ACTION_WIDTH + (absDx - ACTION_WIDTH) * 0.3);
    }

    contentEl.style.transform = `translateX(${visualDx}px)`;

    // Opacity e scala dell'icona delete
    const progress = Math.min(absDx / ACTION_WIDTH, 1);
    action.style.opacity = progress;
    const circle = action.querySelector('.swipe-delete-circle');
    if (circle) circle.style.transform = `scale(${0.5 + progress * 0.5})`;
  }

  function onEnd() {
    if (!isDragging || isAnimating) return;
    isDragging = false;

    const wrapperWidth = wrapper.offsetWidth;
    const absDx = Math.abs(currentDx);

    contentEl.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)';
    action.style.transition = 'opacity 0.3s ease';

    if (absDx > wrapperWidth * THRESHOLD) {
      // Swipe completo → delete
      doDelete();
    } else {
      // Spring back
      contentEl.style.transform = 'translateX(0)';
      action.style.opacity = '0';
    }
  }

  function doDelete() {
    isAnimating = true;
    contentEl.style.transition = 'transform 0.3s ease-out';
    contentEl.style.transform = `translateX(-${wrapper.offsetWidth + 20}px)`;

    sfx.playDelete();

    setTimeout(() => {
      wrapper.style.transition = 'height 0.25s ease, opacity 0.25s ease, margin 0.25s ease, padding 0.25s ease';
      wrapper.style.height = wrapper.offsetHeight + 'px';

      requestAnimationFrame(() => {
        wrapper.style.height = '0px';
        wrapper.style.opacity = '0';
        wrapper.style.marginTop = '0';
        wrapper.style.marginBottom = '0';
        wrapper.style.paddingTop = '0';
        wrapper.style.paddingBottom = '0';
      });

      setTimeout(() => {
        isAnimating = false;
        if (onDelete) onDelete();
      }, 280);
    }, 250);
  }

  // Click sull'icona delete
  action.addEventListener('click', (e) => {
    e.stopPropagation();
    doDelete();
  });

  // Touch events
  contentEl.addEventListener('touchstart', (e) => {
    onStart(e.touches[0].clientX);
  }, { passive: true });

  contentEl.addEventListener('touchmove', (e) => {
    if (isDragging && Math.abs(currentDx) > 10) {
      e.preventDefault();
    }
    onMove(e.touches[0].clientX);
  }, { passive: false });

  contentEl.addEventListener('touchend', () => onEnd());
  contentEl.addEventListener('touchcancel', () => onEnd());

  // Mouse events (for desktop testing)
  contentEl.addEventListener('mousedown', (e) => {
    onStart(e.clientX);
    const onMouseMove = (ev) => onMove(ev.clientX);
    const onMouseUp = () => {
      onEnd();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}
