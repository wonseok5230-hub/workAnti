// 1. 타이핑 애니메이션 (Typing Effect)
const titleElement = document.querySelector('.type-text');
const textToType = "운영지원팀 최원석";
let typeIndex = 0;

titleElement.textContent = "";

function typeWriter() {
    if (typeIndex < textToType.length) {
        titleElement.textContent += textToType.charAt(typeIndex);
        typeIndex++;
        // 타이핑 속도(랜덤값 부여로 실제 사람이 치는 듯한 효과)
        setTimeout(typeWriter, Math.random() * 50 + 100);
    } else {
        // 타이핑 종료 후 커서 깜빡임 효과를 자연스럽게 유지
        setTimeout(() => {
            titleElement.style.borderRightColor = 'transparent';
        }, 3000);
    }
}

// 스크립트가 로드되고 0.6초 뒤에 아름답게 타이핑 시작
setTimeout(typeWriter, 600);

// 2. 부드러운 스크롤 등장 애니메이션 (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // 15% 정도 보였을 때 등장
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // 한번 등장한 요소는 다시 감지하지 않음
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 화면에서 animate-on-scroll 클래스를 가진 모든 카드를 관찰 대상에 등록
document.querySelectorAll('.animate-on-scroll').forEach((section, index) => {
    // 요소를 약간씩 시차 지연을 두어 화면에 나타나게 만듦 (Staggered Animation)
    section.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(section);
});

// === 로그인(Login) 기능 모의 연동 플로우 ===
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeBtn = document.querySelector('.close-btn');
const submitLoginBtn = document.getElementById('submit-login');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-msg');
const secretContent = document.getElementById('secret-content');
const greetingName = document.querySelector('.name');

function openModal() {
    loginModal.classList.remove('hidden');
    usernameInput.focus();
}

function closeModal() {
    loginModal.classList.add('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    errorMsg.classList.add('hidden');
}

loginBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);

// 외부 클릭 시 닫기
loginModal.addEventListener('click', (e) => {
    if(e.target === loginModal) closeModal();
});

// 로그인 시도 함수
function handleLogin() {
    const id = usernameInput.value.trim();
    const pw = passwordInput.value.trim();

    // ID, PW 검증
    if (id === 'admin' && pw === '1234') {
        closeModal();
        
        // 로그인 상태 UI 변환
        loginBtn.style.display = 'none';
        greetingName.innerHTML = `<span class="highlight">최원석 (Admin)</span>입니다.`;
        
        // 숨겨진 비밀 공간 나타나기
        secretContent.style.display = 'block';
        secretContent.style.transitionDelay = '0s'; // 기존 딜레이 제거
        
        // 브라우저 렌더링 후 부드러운 등장(fade-in) 적용 및 자동 스크롤
        setTimeout(() => {
            secretContent.classList.add('visible');
            setTimeout(() => {
                secretContent.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 100);
        
    } else {
        // 실패 시 에러 표시 및 흔들림(shake) 타격 효과
        errorMsg.classList.remove('hidden');
        const modalBox = document.querySelector('.modal-content');
        modalBox.classList.remove('shake');
        void modalBox.offsetWidth; // 브라우저 리플로우 강제 적용
        modalBox.classList.add('shake');
    }
}

submitLoginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
});
