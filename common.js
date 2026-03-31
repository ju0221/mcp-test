// =============================================
// Tab bar interaction
// =============================================
document.querySelectorAll('.tab-bar').forEach(function (tabBar) {
  tabBar.querySelectorAll('.tab-item').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabBar.querySelectorAll('.tab-item').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
    });
  });
});

// =============================================
// Clear button: show/hide based on input value
// =============================================
document.querySelectorAll('.input-wrap').forEach(function (wrap) {
  var input = wrap.querySelector('.input');
  var clearBtn = wrap.querySelector('.input-clear');
  if (!input || !clearBtn) return;

  function updateClear() {
    if (input.value.length > 0) {
      clearBtn.classList.add('is-visible');
    } else {
      clearBtn.classList.remove('is-visible');
    }
  }

  input.addEventListener('input', updateClear);
  // run on load for pre-filled inputs
  updateClear();

  clearBtn.addEventListener('mousedown', function (e) {
    // prevent input from losing focus before clear
    e.preventDefault();
  });
  clearBtn.addEventListener('click', function () {
    input.value = '';
    clearBtn.classList.remove('is-visible');
    input.focus();
  });
});

// =============================================
// Split 주민번호: auto-advance on 6 chars
// =============================================
var idFront = document.getElementById('id-front');
var idBack  = document.getElementById('id-back');
if (idFront && idBack) {
  idFront.addEventListener('input', function () {
    if (idFront.value.length === 6) idBack.focus();
  });
}
