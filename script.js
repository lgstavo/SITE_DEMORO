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

    // Guarda: sem esse if, uma pagina sem .hamburger lancaria TypeError e
    // abortaria o resto do DOMContentLoaded (fade-in e carrossel parariam).
    if (hamburger && menu) {
        // Mantem o aria-expanded em sincronia com o estado visual,
        // para leitores de tela saberem se o menu esta aberto.
        const setMenuAberto = (aberto) => {
            menu.classList.toggle('active', aberto);
            hamburger.setAttribute('aria-expanded', String(aberto));
            hamburger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        };

        hamburger.addEventListener('click', function() {
            setMenuAberto(!menu.classList.contains('active'));
        });

        // Fecha o menu ao clicar em um link (mobile)
        menu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                setMenuAberto(false);
            }
        });

        // Esc fecha o menu e devolve o foco ao botao
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                setMenuAberto(false);
                hamburger.focus();
            }
        });
    }

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
                // Opcional: Para de "observar" o elemento depois que a animação já aconteceu
                observer.unobserve(entry.target);
            }
        });
    };

    // 4. Cria o observador
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 5. Diz ao observador para "observar" cada um dos nossos elementos
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
            // Ativa a animação na CSS
            scroller.setAttribute("data-animated", true);

            // Pega os itens dentro da galeria
            const scrollerContent = Array.from(scroller.children);

            // Cria um wrapper interno para a animação
            const scrollerInner = document.createElement('div');
            scrollerInner.classList.add('scroller__inner');
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

