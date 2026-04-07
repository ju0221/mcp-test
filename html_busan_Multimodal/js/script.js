// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    new InputManager();     // 인풋 삭제
    new CardMasker();       // input 마스킹처리
    new selectAccount();    // 계좌선택
    new AreaNumber();       // 지역번호 선택
    new ExpandCard();       // 토글 박스
    new selectBank();       // 은행 선택
});

class CardMasker {
    constructor(selector = '.cp-inp-text.mask') {
        this.selector = selector;
        this.inputs = document.querySelectorAll(this.selector);

        // 요소가 존재할 때만 실행 (안전장치)
        if (this.inputs.length > 0) {
            this._init();
        }
    }

    /**
     * 내부 초기화 메서드 (관례상 _를 붙임)
     */
    _init() {
        this.inputs.forEach(input => {
            // 초기 데이터 세팅
            input.dataset.realValue = input.value.replace(/\D/g, '');
            input.setAttribute('autocomplete', 'off'); // 자동완성 방지

            // 이벤트 바인딩 (this 바인딩 유지)
            input.addEventListener('input', (e) => this._handleInput(e));
            input.addEventListener('keydown', (e) => this._handleKeyDown(e));
            input.addEventListener('paste', (e) => e.preventDefault()); // 복붙 방지
        });
    }

    _handleInput(e) {
        const input = e.target;
        const currentVal = input.value;
        let realVal = input.dataset.realValue || "";

        // 1. 값 삭제 시 처리
        if (currentVal.length < realVal.length) {
            realVal = realVal.slice(0, currentVal.length);
        } 
        // 2. 값 추가 시 처리
        else {
            const lastChar = currentVal.slice(-1);
            const maxLength = input.getAttribute('maxlength') || 4;

            // 숫자만 허용하며 최대 길이를 넘지 않게 저장
            if (/\d/.test(lastChar) && realVal.length < maxLength) {
                realVal += lastChar;
            }
        }

        // 상태 저장 및 마스킹 출력
        input.dataset.realValue = realVal;
        input.value = "●".repeat(realVal.length);
    }

    _handleKeyDown(e) {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'];
        // 숫자가 아니고 특수키도 아니라면 차단
        if (!/[0-9]/.test(e.key) && e.key.length === 1 && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }
}

// 모달 닫기
function closeModal(modalName) {
    const modal = document.querySelector(`.modal-pop[data-modal="${modalName}"]`);
    if (modal) {
        modal.classList.remove('show');
    }
}

// 모달 열기
function openModal(modalName) {
    const modal = document.querySelector(`.modal-pop[data-modal="${modalName}"]`);
    if (modal) {
        modal.classList.add('show');
    }
}

// 바텀시트 열기
function openBottomSheet(id) {
  const sheet = document.getElementById(id);
  if (sheet) {
    sheet.classList.add('active');
  }
}

// 바텀시트 닫기
function closeBottomSheet(id) {
  const sheet = document.getElementById(id);
  if (sheet) {
    sheet.classList.remove('active');
  }
}

// 금액 입력 타입
class EmptyClassToggler {
    constructor(wrapperSelector) {
        this.wrapperSelector = wrapperSelector;
        this.inputs = this.getTargetInputs();
        this.init();
    }

    getTargetInputs() {
        const wrappers = document.querySelectorAll(this.wrapperSelector);
        const inputs = [];
        wrappers.forEach(wrapper => {
            const input = wrapper.querySelector('.cp-inp-text');
            if (input) inputs.push(input);
        });
        return inputs;
    }

    init() {
        this.inputs.forEach(input => {
            this.toggleClass(input); // 초기 상태
			this.formatComma(input); // 초기 포맷팅
            input.addEventListener('input', (e) => {
                this.formatComma(input);
                this.toggleClass(input);
            });
        });
    }

    toggleClass(input) {
        const wrapper = input.closest('.cp-inp');
        if (!wrapper) return;

        if (input.value.trim()) {
            wrapper.classList.remove('is-empty');
        } else {
            wrapper.classList.add('is-empty');
        }
    }
	formatComma(input) {
        // 커서 위치 저장
        const cursorPos = input.selectionStart;

        // 숫자만 추출
        const rawValue = input.value.replace(/,/g, '').replace(/[^\d]/g, '');

        if (!rawValue) {
            input.value = '';
            return;
        }

        // 천 단위 콤마 추가
        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        input.value = formattedValue;

        // 커서 위치 보정
        const diff = formattedValue.length - rawValue.length;
        input.setSelectionRange(cursorPos + diff, cursorPos + diff);
    }
}

// 탭버튼
class TabSelector {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.buttons = this.container.querySelectorAll('.cp-tab__btn');
        this.init();
    }

    init() {
        this.buttons.forEach((button) => {
            button.addEventListener('click', () => {
                this.clearSelection();
                button.classList.add('is-select');
            });
        });
    }

    clearSelection() {
        this.buttons.forEach((btn) => btn.classList.remove('is-select'));
    }
}

// 콤보 박스
function InitSelectToggle(selector) {
	const selectWrappers = document.querySelectorAll(selector);

	selectWrappers.forEach(wrapper => {
		const toggleBtn = wrapper.querySelector('.cp-select-btn');
		const closeBtn = wrapper.querySelector('.cp-select-pop-close .btn-close');
		const confirmBtn = wrapper.querySelector('.cp-select-pop-btn .btn-default');
		const itemButtons = wrapper.querySelectorAll('.cp-select-pop-item');
		const textTarget = wrapper.querySelector('.cp-select-txt');

		// 열기/닫기 토글
		if (toggleBtn) {
			toggleBtn.addEventListener('click', () => {
				wrapper.classList.toggle('is-open');
			});
		}

		// 닫기 버튼
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				wrapper.classList.remove('is-open');
			});
		}

		// 옵션 항목 클릭
		itemButtons.forEach(item => {
			item.addEventListener('click', () => {
				// 모든 항목에서 is-checked 제거
				itemButtons.forEach(el => el.classList.remove('is-checked'));

				// 클릭한 항목에만 추가
				item.classList.add('is-checked');
			});
		});

		// 확인 버튼 클릭 시 텍스트 반영 및 클래스 설정
		if (confirmBtn) {
			confirmBtn.addEventListener('click', () => {
				const checked = wrapper.querySelector('.cp-select-pop-item.is-checked');
				if (checked) {
					const txt = checked.querySelector('.pop-item-txt')?.textContent?.trim();
					if (txt && textTarget) {
						textTarget.textContent = txt;
						wrapper.classList.add('is-selected');
					}
				}

				// 팝업 닫기
				wrapper.classList.remove('is-open');
			});
		}
	});
}

/**
 * 📑 AllAgree – “전체 동의” 체크 기능 클래스
 * -------------------------------------------------
 * ▸ HTML 구조(마크업) 고정: ① #chkall ② .p-chkbox
 * ▸ 재사용: new AllAgree('.cp-all-agree');
 *           또는 new AllAgree(document.querySelector('.cp-all-agree'));
 */
class AllAgree {
    /**
     * @param {string|HTMLElement} root  .cp-all-agree 래퍼 요소(또는 셀렉터)
     * @param {Object} [opts]
     * @param {string} [opts.allSelector='#chkall']   전체 동의 체크박스
     * @param {string} [opts.itemSelector='.p-chkbox']개별 약관 체크박스
     * @param {string} [opts.activeClass='is-checked']라벨에 붙일 활성 클래스
     */
    constructor(root, opts = {}) {
        this.opts  = Object.assign({
            allSelector  : '#chkall',
            itemSelector : '.p-chkbox',
            activeClass  : 'is-checked'
        }, opts);

        this.root     = typeof root === 'string' ? document.querySelector(root) : root;
        if (!this.root) throw new Error('AllAgree: 유효한 root 요소가 없습니다.');

        this.allChk   = this.root.querySelector(this.opts.allSelector);
        this.itemChks = [...this.root.querySelectorAll(this.opts.itemSelector)];
        if (!this.allChk || this.itemChks.length === 0)
            throw new Error('AllAgree: 체크박스 셀렉터를 확인하세요.');

        this.bindEvents();
    }

    bindEvents() {
        // 전체 동의 클릭
        this.allChk.addEventListener('change', () => this.toggleAll(this.allChk.checked));

        // 개별 체크박스 클릭
        this.itemChks.forEach(inp =>
            inp.addEventListener('change', () => this.syncAllState())
        );
    }

    /** 전체 ON/OFF → 개별 반영 */
    toggleAll(state) {
        this.itemChks.forEach(inp => {
            inp.checked = state;
            this.setLabelState(inp, state);
        });
    }

    /** 개별 변경 시 전체 체크 상태 갱신 */
    syncAllState() {
        const allChecked = this.itemChks.every(inp => inp.checked);
        this.allChk.checked = allChecked; // 시각적 동기화
    }

    /** 라벨 is-checked 클래스 토글 */
    setLabelState(input, state) {
        const label = input.nextElementSibling;
        if (label) label.classList.toggle(this.opts.activeClass, state);
    }
}

// 데이트피커
class DatePickerBottomSheet {
  constructor(options = {}) {
    this.options = {
      sheetSelector: '#dpSheet',
      calendarWrapSelector: '#dpCalendarWrap',
      inputSelector: '.cp-inp-text.dp',
      startSelector: '.cp-inp-text.dp[data-date-role="start"]',
      endSelector: '.cp-inp-text.dp[data-date-role="end"]',
      dateFormat: 'Y-m-d',
      jumpMonthUnit: 12, // << >> 이동 단위 (12 = 1년)
      globalMinDate: null,
      globalMaxDate: null,
      autoInit: true,
      ...options
    };

    this.sheet = document.querySelector(this.options.sheetSelector);
    this.calendarWrap = document.querySelector(this.options.calendarWrapSelector);
    this.dateInputs = document.querySelectorAll(this.options.inputSelector);
    this.closeTriggers = this.sheet ? this.sheet.querySelectorAll('[data-sheet-close]') : [];

    this.activeInput = null;
    this.fp = null;

    this.onEscKeydown = this.onEscKeydown.bind(this);

    if (this.options.autoInit) this.init();
  }

  init() {
    if (typeof window.flatpickr !== 'function') {
      console.error('[DatePickerBottomSheet] flatpickr가 로드되지 않았습니다.');
      return;
    }

    if (!this.sheet || !this.calendarWrap) {
      console.error('[DatePickerBottomSheet] sheet 또는 calendarWrap 요소를 찾지 못했습니다.');
      return;
    }

    this.bindInputEvents();
    this.bindCloseEvents();
    document.addEventListener('keydown', this.onEscKeydown);
  }

  bindInputEvents() {
    this.dateInputs.forEach((inputEl) => {
      inputEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(inputEl);
      });
    });
  }

  bindCloseEvents() {
    this.closeTriggers.forEach((el) => {
      el.addEventListener('click', () => this.close());
    });
  }

  onEscKeydown(e) {
    if (e.key === 'Escape' && this.sheet.classList.contains('is-open')) {
      this.close();
    }
  }

  formatDate(dateObj) {
    if (!dateObj) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  parseDate(value) {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;

    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    const date = new Date(y, m, d);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== y ||
      date.getMonth() !== m ||
      date.getDate() !== d
    ) {
      return null;
    }
    return date;
  }

  getRangeLinkedLimits(role) {
    const startInput = document.querySelector(this.options.startSelector);
    const endInput = document.querySelector(this.options.endSelector);

    const startDate = startInput ? this.parseDate(startInput.value) : null;
    const endDate = endInput ? this.parseDate(endInput.value) : null;

    let minDate = this.options.globalMinDate || null;
    let maxDate = this.options.globalMaxDate || null;

    if (role === 'start' && endDate) maxDate = endDate;
    if (role === 'end' && startDate) minDate = startDate;

    return { minDate, maxDate };
  }

  open(inputEl) {
    this.activeInput = inputEl;

    const role = inputEl.dataset.dateRole;

    const currentValue = inputEl.value || inputEl.placeholder;
    const currentDate = this.parseDate(currentValue) || new Date();
    const limits = this.getRangeLinkedLimits(role);

    this.renderCalendar(currentDate, limits);

    this.sheet.classList.add('is-open');
    this.sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.sheet.classList.remove('is-open');
    this.sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeInput = null;
  }

  renderCalendar(defaultDate, limits = {}) {
    if (this.fp) {
      this.fp.destroy();
      this.fp = null;
    }

    this.calendarWrap.innerHTML = '';
    const host = document.createElement('div');
    this.calendarWrap.appendChild(host);

    this.fp = flatpickr(host, {
      inline: true,
      locale: (window.flatpickr && flatpickr.l10ns && flatpickr.l10ns.ko) ? flatpickr.l10ns.ko : 'ko',
      dateFormat: this.options.dateFormat,
      defaultDate,
      minDate: limits.minDate || null,
      maxDate: limits.maxDate || null,
      disableMobile: true,
      clickOpens: false,
      monthSelectorType: 'static',
      prevArrow: '<span aria-hidden="true"></span>',
      nextArrow: '<span aria-hidden="true"></span>',
      onReady: () => {
        this.renderCustomHeader();
        this.calendarWrap.querySelectorAll('button').forEach(btn=>{
          btn.type = 'button';
        });
        requestAnimationFrame(() => this.renderCustomHeader());
      },
      onMonthChange: () => {
        this.renderCustomHeader();
        requestAnimationFrame(() => this.renderCustomHeader()); 
      },
      onYearChange: () => {
        this.renderCustomHeader();
        requestAnimationFrame(() => this.renderCustomHeader()); 
      },
      onChange: (selectedDates) => {
        const selected = selectedDates[0];
        if (!selected || !this.activeInput) return;

        this.activeInput.value = this.formatDate(selected);
        this.updateFilledState(this.activeInput);
        this.normalizeRangeOrder();
        this.close();
      }
    });
  }

  normalizeRangeOrder() {
    const startInput = document.querySelector(this.options.startSelector);
    const endInput = document.querySelector(this.options.endSelector);
    if (!startInput || !endInput || !startInput.value || !endInput.value) return;

    const startDate = this.parseDate(startInput.value);
    const endDate = this.parseDate(endInput.value);
    if (!startDate || !endDate) return;

    if (startDate > endDate) {
      const temp = startInput.value;
      startInput.value = endInput.value;
      endInput.value = temp;
    }
  }

  renderCustomHeader() {
    if (!this.fp || !this.fp.calendarContainer) return;

    const monthsEl = this.fp.calendarContainer.querySelector('.flatpickr-months');
    if (!monthsEl) return;

    // 디버깅 로그
    console.log('[renderCustomHeader] monthsEl:', monthsEl);

    // 기존 커스텀 헤더 제거
    const old = monthsEl.querySelector('.fp-custom-nav');
    if (old) old.remove();

    // 부모 기준점
    monthsEl.style.position = 'relative';
    monthsEl.style.minHeight = '44px';

    const nav = document.createElement('div');
    nav.className = 'fp-custom-nav';

    // 디버깅용 인라인 스타일 (CSS 무시하고도 보이게)
    nav.style.position = 'absolute';
    nav.style.inset = '0';
    nav.style.zIndex = '999';
    nav.style.display = 'grid';
    nav.style.gridTemplateColumns = '25px 29px 1fr 29px 25px';
    nav.style.alignItems = 'center';
    nav.style.gap = '8px';
    nav.style.height = '44px';
    nav.style.width = '100%';
    nav.style.background = 'rgba(255,255,255,0.98)';

    const makeBtn = (aria, className, handler ) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className; // 클래스 추가
      btn.setAttribute('aria-label', aria);
      btn.style.cursor = 'pointer';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.fp) return;
        handler();
      });

      return btn;
    };

    const btnJumpPrev = makeBtn('이전 크게 이동', 'fp-nav-btn prev-year', () => {
      this.fp.changeMonth(-this.options.jumpMonthUnit);
    });

    const btnPrev = makeBtn('이전 1개월', 'fp-nav-btn prev', () => {
      this.fp.changeMonth(-1);
    });

    const title = document.createElement('div');
    title.className = 'fp-nav-title';
    title.setAttribute('aria-label', '현재 년월');

    const year = String(this.fp.currentYear);
    const month = String(this.fp.currentMonth + 1).padStart(2, '0');

    title.innerHTML = `<span class="fp-nav-title__num">${year}</span>년 <span class="fp-nav-title__num">${month}</span>월`;

    const btnNext = makeBtn('다음 1개월', 'fp-nav-btn next', () => {
      this.fp.changeMonth(1);
    });

    const btnJumpNext = makeBtn('다음 크게 이동', 'fp-nav-btn next-year', () => {
      this.fp.changeMonth(this.options.jumpMonthUnit);
    });

    nav.appendChild(btnJumpPrev);
    nav.appendChild(btnPrev);
    nav.appendChild(title);
    nav.appendChild(btnNext);
    nav.appendChild(btnJumpNext);

    monthsEl.appendChild(nav);

    console.log('[renderCustomHeader] appended:', nav);
  }

  createNavBtn(text, className, ariaLabel, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = text;
    btn.setAttribute('aria-label', ariaLabel);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.fp) return;
      onClick();
    });
    return btn;
  }

  updateFilledState(inputEl) {
    if (!inputEl) return;

    if (inputEl.value && inputEl.value.trim() !== '') {
      inputEl.classList.add('is-filled');
    } else {
      inputEl.classList.remove('is-filled');
    }
  }  

  destroy() {
    if (this.fp) {
      this.fp.destroy();
      this.fp = null;
    }
    document.removeEventListener('keydown', this.onEscKeydown);
  }
}
  
  // 사용
  // console.log('flatpickr:', typeof window.flatpickr);
  // console.log('#dpSheet:', document.querySelector('#dpSheet'));
  // console.log('#dpCalendarWrap:', document.querySelector('#dpCalendarWrap'));
  // console.log('.cp-inp-text.dp count:', document.querySelectorAll('.cp-inp-text.dp').length);

  // const dpSheet = new DatePickerBottomSheet({
  //     jumpMonthUnit: 12,
  //     targetTextSelector: null
  //     globalMinDate: '2024-01-01', // 전체 최소 선택 가능일
  //     globalMaxDate: '2026-12-31'  // 전체 최대 선택 가능일
  // });

  // console.log('dpSheet instance:', dpSheet);
  // window.dpSheetInstance = dpSheet;

class InputManager {
    constructor() {
        this.init();
    }

    init() {
        const containers = document.querySelectorAll('.cp-inp');
        
        containers.forEach(container => {
            const input = container.querySelector('.cp-inp-text');
            const deleteBtn = container.querySelector('.cp-inp-delete');

            if (!input || !deleteBtn) return;

            deleteBtn.style.display = 'none';
            this.handleValueState(container, input, deleteBtn);

            input.addEventListener('input', () => {
                this.handleValueState(container, input, deleteBtn);
            });

            input.addEventListener('focus', () => {
                this.handleValueState(container, input, deleteBtn);
            });

            input.addEventListener('blur', () => {
                // 약간의 지연 시간을 주어 버튼 클릭 이벤트 방해하지 않음
                setTimeout(() => {
                    this.handleValueState(container, input, deleteBtn);
                }, 100);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                this.clearInput(container, input, deleteBtn);
            });
        });
    }

    handleValueState(container, input, btn) {
        const hasValue = input.value.length > 0;
        const isFocused = document.activeElement === input;

        // 1. 클래스 제어 로직 변경
        // 값이 있고 + 포커스가 나간 상태(blur)일 때만 'has-value' 추가
        if (hasValue && !isFocused) {
            container.classList.add('has-value');
        } else {
            container.classList.remove('has-value');
        }

        // 2. 삭제 버튼 제어 로직 (기존과 동일: 값이 있고 포커스 상태일 때만 표시)
        if (hasValue && isFocused) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    }

    clearInput(container, input, btn) {
        input.value = '';
        if(input.dataset.realValue !== undefined) {
            input.dataset.realValue = '';
        }
        // 삭제 직후에는 다시 포커스가 가므로 클래스는 빠지고 버튼은 숨겨짐
        this.handleValueState(container, input, btn);
        input.focus(); 
    }
}

class selectAccount {
    constructor() {
        this.combobox = document.querySelector('[data-type="selectAccount"]');
        if (!this.combobox) return;

        this.btn = this.combobox.querySelector('.combobox__btn');
        if (!this.btn) return;

        this.sheet = document.getElementById('selectAccount');
        if (!this.sheet) return;

        this.closeBtn = this.sheet.querySelector('.bs-close');
        this.items = this.sheet.querySelectorAll('.acclist-btn');
        if (!this.items.length) return;

        this.init();
    }

    init() {
        // 열기
        this.btn.addEventListener('click', () => {
            this.sheet.classList.add('active');
        });

        // 닫기
        if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => {
            this.sheet.classList.remove('active');
        });
        }

        // 선택
        this.items.forEach(btn => {
            btn.addEventListener('click', (e) => {

                const item = e.currentTarget.closest('.acclist-item');
                if (!item) return;

                this.sheet.querySelectorAll('.acclist-item').forEach(i=>{
                    i.classList.remove('checked');
                });

                item.classList.add('checked');

                const nameEl = item.querySelector('.acc-name');
                const numEl = item.querySelector('.acc-num');

                const name = nameEl ? nameEl.textContent.trim() : '';
                const num = numEl ? numEl.textContent.trim() : '';

                this.btn.innerHTML = `
                <div class="acclist-info">
                    <span class="acc-name">${name}</span>
                    <span class="acc-num">${num}</span>
                </div>
                `;

                this.sheet.classList.remove('active');

            });
        });
    }
}

class AreaNumber {
    constructor() {
        // data-type이 areaNumber인 컨테이너를 찾습니다.
        this.combobox = document.querySelector('[data-type="areaNumber"]');
        if (!this.combobox) return;

        this.btn = this.combobox.querySelector('.combobox__btn');
        if (!this.btn) return;

        this.btnTxt = this.btn.querySelector('.combobox__btn-txt');
        this.sheet = document.getElementById('areaNum');
        if (!this.sheet) return;

        this.closeBtn = this.sheet.querySelector('.bs-close');
        this.items = this.sheet.querySelectorAll('.num-btn');
        
        this.init();
    }

    init() {
        // 바텀시트 열기
        this.btn.addEventListener('click', () => {
            this.sheet.classList.add('active');
        });

        // 바텀시트 닫기 (X 버튼)
        if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => {
            this.sheet.classList.remove('active');
        });
        }

        // 지역번호 항목 선택
        this.items.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.num-item');
                if (!item) return;

                // 기존 선택 해제 및 새로운 항목 체크 표시 (클래스 기반)
                this.sheet.querySelectorAll('.num-item').forEach(i => {
                    i.classList.remove('checked');
                });
                item.classList.add('checked');

                // 선택한 텍스트 가져오기
                const numTxtEl = item.querySelector('.num-txt');
                const selectedValue = numTxtEl ? numTxtEl.textContent.trim() : '';

                // 버튼 텍스트 업데이트
                if (this.btnTxt) {
                    this.btnTxt.textContent = selectedValue;
                    this.btn.classList.add('has-value');
                } else {
                    // 구조가 다를 경우를 대비한 대체 로직
                    this.btn.innerHTML = `<span class="combobox__btn-txt">${selectedValue}</span>`;
                }

                // 바텀시트 닫기
                this.sheet.classList.remove('active');
            });
        });
    }
}

class ExpandCard {

  constructor() {
    this.cards = document.querySelectorAll('[data-ui="expandCard"]');
    if (!this.cards.length) return;

    this.init();
  }

  init() {

    this.cards.forEach((card) => {

      const btn = card.querySelector('.expand-card__toggle');
      if (!btn) return;

      btn.addEventListener('click', () => {
        this.toggle(card, btn);
      });

    });

  }

    toggle(card, btn) {

    const txt = btn.querySelector('.txt');

    const isOpen = card.classList.toggle('is-open');

    btn.setAttribute('aria-expanded', isOpen);

    if (txt) {
        txt.textContent = isOpen ? '닫기' : '상세보기';
    }

    }
}

class selectBank {

    constructor() {

        this.combobox = document.querySelector('[data-type="selectBank"]');
        if (!this.combobox) return;

        this.btn = this.combobox.querySelector('.combobox__btn');
        this.btnTxt = this.combobox.querySelector('.combobox__btn-txt');

        this.sheet = document.getElementById('selectBank');
        if (!this.sheet) return;

        this.closeBtn = this.sheet.querySelector('.bs-close');

        this.tabs = this.sheet.querySelectorAll('.tab');
        this.tabContents = this.sheet.querySelectorAll('.tab-cont');

        this.items = this.sheet.querySelectorAll('.bank-list__btn');

        this.init();
    }

    init() {

        // 탭 전환
        this.tabs.forEach((tab, index) => {

            tab.addEventListener('click', () => {

                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                this.tabContents.forEach(cont => cont.classList.add('hidden'));
                this.tabContents[index].classList.remove('hidden');

            });

        });


        // 은행 / 증권사 선택
        this.items.forEach(btn => {

            btn.addEventListener('click', () => {

                // 1. 모든 아이템에서 checked 클래스 제거 (초기화)
                this.items.forEach(item => item.classList.remove('checked'));
                
                // 2. 현재 클릭한 버튼에 checked 클래스 추가
                btn.classList.add('checked');

                const txt = btn.querySelector('.bank-list__txt').textContent.trim();

                // 텍스트 변경
                this.btnTxt.textContent = txt;

                // 기존 ico 관련 클래스 제거 및 기본 클래스 설정
                this.btn.classList.remove(...this.btn.classList);
                this.btn.classList.add('combobox__btn', 'has-value');

                // 선택된 버튼의 클래스(예: 은행 로고 클래스 등)를 콤보박스 버튼에 복사
                btn.classList.forEach(cls => {
                    // 'bank-list__btn'과 'checked'는 복사에서 제외
                    if (cls !== 'bank-list__btn' && cls !== 'checked') {
                        this.btn.classList.add(cls);
                    }
                });

                // bottom sheet 닫기
                closeBottomSheet('selectBank');

            });

        });

    }

}

class AccordionAgree {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.js-acc-item');
    
    if (this.items.length === 0) return;
    this.init();
  }

  init() {
    this.items.forEach(item => {
      const header = item.querySelector('.agree-header');
      const toggleBtn = item.querySelector('.btn-toggle');
      const content = item.querySelector('.agree-content');
      const allChk = item.querySelector('.chk-all');
      const subChks = item.querySelectorAll('.chk-sub');

      // 1. 아코디언 토글 이벤트
      header.addEventListener('click', (e) => {
        // 체크박스 영역 클릭 시에는 아코디언이 작동하지 않도록 함
        if (e.target.closest('.chk-group')) return;
        this.toggle(item, toggleBtn, content);
      });

      // 2. 전체 체크박스 이벤트
      if (allChk) {
        allChk.addEventListener('change', () => {
          subChks.forEach(chk => {
            chk.checked = allChk.checked;
          });
        });
      }

      // 3. 개별 체크박스 이벤트 (전체 체크박스 상태 연동)
      subChks.forEach(chk => {
        chk.addEventListener('change', () => {
          const checkedCount = item.querySelectorAll('.chk-sub:checked').length;
          if (allChk) {
            allChk.checked = (checkedCount === subChks.length);
          }
        });
      });
    });
  }

  // 아코디언 열기/닫기 메서드
  toggle(item, btn, content) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    
    // 상태 반전
    btn.setAttribute('aria-expanded', !isExpanded);
    content.hidden = isExpanded;
    item.classList.toggle('is-active', !isExpanded);
  }
}

// 페이지 로드 시 모든 모듈 초기화
// document.addEventListener('DOMContentLoaded', () => {
//   const agreeModules = document.querySelectorAll('[data-module="accordion-agree"]');
//   agreeModules.forEach(module => new AccordionAgree(module));
// });