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
