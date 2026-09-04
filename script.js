// Espera o conteúdo da página carregar completamente
document.addEventListener('DOMContentLoaded', function() {


    // =============================================================
    // VIDEO DO HERO (somente mobile)
    //
    // Usamos a IFrame Player API porque o evento 'ended' de <video>
    // NAO dispara em iframe -- era por isso que o scroll automatico
    // nunca funcionou.
    // =============================================================
    const slotVideo = document.querySelector('.video-slot');

    if (slotVideo) {
        // Lidos agora porque a API substitui o elemento pelo <iframe>
        const idVideo = slotVideo.dataset.youtubeId;
        const seletorAlvo = slotVideo.dataset.scrollPara;

        // Casa com o @media (min-width: 768px) do CSS
        const ehMobile = window.matchMedia('(max-width: 767.98px)');
        let jaCriado = false;

        const aoTerminarVideo = () => {
            const alvo = seletorAlvo && document.querySelector(seletorAlvo);
            if (!alvo) return;
            const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            alvo.scrollIntoView({ behavior: menosMovimento ? 'auto' : 'smooth' });
        };

        const criarPlayer = () => {
            if (jaCriado || !idVideo) return;
            jaCriado = true;
            new YT.Player(slotVideo, {
                videoId: idVideo,
                playerVars: {
                    autoplay: 1,
                    mute: 1,        // sem isso o autoplay e bloqueado
                    playsinline: 1, // sem isso o iOS abre em tela cheia
                    rel: 0,
                    modestbranding: 1
                },
                events: {
                    onReady: (e) => { e.target.mute(); e.target.playVideo(); },
                    onStateChange: (e) => {
                        if (e.data === YT.PlayerState.ENDED) aoTerminarVideo();
                    }
                }
            });
        };

        const carregarApi = () => {
            if (jaCriado) return;
            if (window.YT && window.YT.Player) { criarPlayer(); return; }

            // A API avisa que carregou chamando esta funcao global
            const anterior = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function () {
                if (typeof anterior === 'function') anterior();
                criarPlayer();
            };

            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
        };

        if (ehMobile.matches) carregarApi();
        // Cobre girar o aparelho ou redimensionar a janela para mobile
        ehMobile.addEventListener('change', (e) => { if (e.matches) carregarApi(); });
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
    // threshold 0 + rootMargin negativo no lugar de threshold 0.24:
    // com 0.24 um elemento mais alto que ~4x a viewport nunca chega a
    // 24% visivel e nunca apareceria. Assim o gatilho independe da altura.
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -12% 0px',
        threshold: 0
    };

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
        configurarBotaoPausar();
    }

    // WCAG 2.2.2: conteudo em movimento precisa de um jeito de parar.
    // O :hover do CSS nao cobre toque nem teclado. O botao nasce com
    // [hidden] no HTML e so aparece se a animacao estiver mesmo ligada.
    function configurarBotaoPausar() {
        const botao = document.querySelector('.botao-pausar');
        const carrossel = document.querySelector('.scrollbar-moradores');
        if (!botao || !carrossel) return;

        botao.hidden = false;
        botao.addEventListener('click', function () {
            const pausado = carrossel.classList.toggle('pausado');
            botao.setAttribute('aria-pressed', String(pausado));
            botao.textContent = pausado ? 'Retomar' : 'Pausar';
        });
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

