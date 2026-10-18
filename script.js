// Espera o conteúdo da página carregar completamente
document.addEventListener('DOMContentLoaded', function() {


    const video = document.querySelector('#video_introducao');
    const proximaSecao = document.querySelector('#rep_section');
    if(video && proximaSecao){
        video.addEventListener('ended', () => {
            proximaSecao.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');

    if (hamburger && menu) {
        // Abre ou fecha o menu e mantém o aria-expanded sincronizado
        const alternarMenu = (abrir) => {
            menu.classList.toggle('active', abrir);
            hamburger.setAttribute('aria-expanded', abrir);
            hamburger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
        };

        hamburger.addEventListener('click', () => {
            alternarMenu(!menu.classList.contains('active'));
        });

        // Fecha ao escolher um link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => alternarMenu(false));
        });

        // Fecha ao clicar fora do menu
        document.addEventListener('click', (event) => {
            const clicouFora = !menu.contains(event.target) && !hamburger.contains(event.target);
            if (clicouFora && menu.classList.contains('active')) {
                alternarMenu(false);
            }
        });

        // Fecha com a tecla Esc e devolve o foco ao botão
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('active')) {
                alternarMenu(false);
                hamburger.focus();
            }
        });

        // A partir de 1024px o menu fica sempre visível: reseta o estado do mobile
        window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
            if (event.matches) alternarMenu(false);
        });
    }

    // 1. Seleciona todos os elementos que serão animados
    const elementsToFadeIn = document.querySelectorAll('.fade-in-element');

    // 2. Opções para o Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.24    };

    // 3. A função que será chamada quando um elemento entrar na tela
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Se o elemento está visível (intersecting)
            if (entry.isIntersecting) {
                // Adiciona a classe '.is-visible' para ativar a animação
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    elementsToFadeIn.forEach(element => {
        observer.observe(element);
    });

    
    const scrollers = document.querySelectorAll(".scrollbar-moradores");

    // Verifica se o usuário não tem preferência por movimento reduzido
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
    }

    function addAnimation() {
        scrollers.forEach((scroller) => {
            // Ativa a animação (as classes data-[animated=true]: do HTML passam a valer)
            scroller.setAttribute("data-animated", true);

            // Pega os itens dentro da galeria
            const scrollerContent = Array.from(scroller.children);

            // Cria um wrapper interno para a animação, estilizado com classes do Tailwind
            const scrollerInner = document.createElement('div');
            scrollerInner.classList.add(
                'flex', 'flex-nowrap', 'w-max', 'gap-4',
                'animate-scroll',
                'group-hover/scroller:[animation-play-state:paused]'
            );
            scroller.appendChild(scrollerInner);

            // Move os itens originais para dentro do wrapper
            scrollerContent.forEach(item => {
                scrollerInner.appendChild(item);
            });

            // Pega os itens novamente, agora dentro do wrapper
            const scrollerInnerContent = Array.from(scrollerInner.children);

            // Clona cada item e adiciona ao final para o loop
            scrollerInnerContent.forEach((item) => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });
        });
    }

});