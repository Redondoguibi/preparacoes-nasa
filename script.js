/**
 * ═══════════════════════════════════════════
 *  Preparações: NASA — Busca por PROVA
 * ═══════════════════════════════════════════
 *
 *  A busca encontra a PROVA inteira (ex: "foguete" acha a seção
 *  "Construção de Foguete"), não subtemas individuais.
 *
 *  Funcionalidades:
 *   1. Busca por nome da prova ou palavras-chave
 *   2. Clique no resultado → scroll suave até a seção
 *   3. Destaque visual temporário na seção encontrada
 *   4. Atalho "/" para focar na busca
 *   5. Escape para limpar e fechar
 */

(function () {
    'use strict';

    // ─── DOM ────────────────────────────────
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const provaSections = document.querySelectorAll('.prova-section');

    // ─── Índice de provas ───────────────────
    // Cada prova tem: id, título, palavras-chave, ícone
    const provasIndex = [];

    provaSections.forEach(function (section) {
        const h2 = section.querySelector('h2');
        if (!h2) return;

        // Remove o número (ex: "01") e pega o título limpo
        const fullTitle = h2.textContent.replace(/^\d{2}\s*/, '').trim().toLowerCase();

        // Monta palavras-chave: título completo + variações
        const titleWords = fullTitle.split(/\s+/);

        // Palavras-chave extras mapeadas manualmente
        const keywordsMap = {
            'construção de foguete': ['foguete', 'rocket', 'foguetes', 'propulsão', 'lançamento', 'estagio', 'estágio'],
            'construção de um habitat lunar': ['habitat', 'lunar', 'maquete', 'lua', 'moon', 'habitat lunar'],
            'construção e programação de um robô': ['robo', 'robô', 'robot', 'programação', 'programacao', 'lego', 'spike', 'sensores'],
            'escudo / blindagem térmica': ['escudo', 'blindagem', 'termica', 'térmica', 'calor', 'ovo', 'heat shield', 'ablação', 'ablacao'],
            'criogenia': ['criogenia', 'cryogenics', 'frio', 'nitrogenio', 'nitrogênio', 'marshmallow', 'congelamento'],
            'cálculo de nutrição de astronautas': ['nutrição', 'nutricao', 'nutrition', 'calorias', 'bioquimica', 'bioquímica', 'metabolismo', 'dieta'],
        };

        let keywords = [...titleWords];
        // Adiciona palavras-chave mapeadas
        Object.keys(keywordsMap).forEach(function (key) {
            if (fullTitle.includes(key)) {
                keywords = keywords.concat(keywordsMap[key]);
            }
        });

        // Ícone baseado no título
        let icon = '📋';
        if (fullTitle.includes('foguete')) icon = '🚀';
        else if (fullTitle.includes('habitat')) icon = '🏠';
        else if (fullTitle.includes('robô')) icon = '🤖';
        else if (fullTitle.includes('escudo') || fullTitle.includes('blindagem')) icon = '🛡️';
        else if (fullTitle.includes('criogenia')) icon = '🧊';
        else if (fullTitle.includes('nutri')) icon = '🧬';

        provasIndex.push({
            id: section.id,
            title: h2.textContent.replace(/^\d{2}\s*/, '').trim(),
            fullTitle: fullTitle,
            keywords: keywords,
            icon: icon,
            element: section,
        });
    });

    // ─── Função de busca ─────────────────────
    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            searchResults.classList.add('hidden');
            removeAllHighlights();
            return;
        }

        const q = query.toLowerCase().trim();
        const words = q.split(/\s+/).filter(function (w) { return w.length > 0; });

        // Para cada prova, calcula um score de match
        const scored = provasIndex.map(function (prova) {
            let score = 0;
            const allText = prova.fullTitle + ' ' + prova.keywords.join(' ');

            // Verifica correspondência exata do título
            if (prova.fullTitle.includes(q)) {
                score += 50;
            }

            // Cada palavra da busca...
            words.forEach(function (word) {
                // ...verifica no título
                if (prova.fullTitle.includes(word)) {
                    score += 15;
                }
                // ...verifica nas palavras-chave
                prova.keywords.forEach(function (kw) {
                    if (kw.includes(word) || word.includes(kw)) {
                        score += 8;
                    }
                });
            });

            // Se todas as palavras estiverem presentes, bônus
            const allPresent = words.every(function (w) {
                return allText.includes(w);
            });
            if (allPresent && words.length > 1) {
                score += 20;
            }

            return { prova: prova, score: score };
        });

        // Filtra apenas resultados com score > 0, ordena por score decrescente
        const results = scored
            .filter(function (r) { return r.score > 0; })
            .sort(function (a, b) { return b.score - a.score; });

        renderResults(results, q);
    }

    // ─── Renderizar resultados ───────────────
    function renderResults(results, rawQuery) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML =
                '<p class="no-results">🔎 Nenhuma prova encontrada para "<strong>' +
                escapeHTML(rawQuery) +
                '</strong>"</p>';
            searchResults.classList.remove('hidden');
            removeAllHighlights();
            return;
        }

        results.forEach(function (r) {
            var prova = r.prova;
            var item = document.createElement('div');
            item.className = 'search-result-item';

            var iconSpan = '<span class="result-icon">' + prova.icon + '</span>';
            var textSpan = '<span class="result-text"><strong>' +
                escapeHTML(prova.title) +
                '</strong></span>';

            item.innerHTML = iconSpan + textSpan;

            item.addEventListener('click', function () {
                // Scroll suave até a seção
                prova.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Destaque temporário
                prova.element.classList.add('search-highlight');
                setTimeout(function () {
                    prova.element.classList.remove('search-highlight');
                }, 2200);

                // Fechar busca
                searchResults.classList.add('hidden');
                searchInput.value = '';
                removeAllHighlights();
            });

            searchResults.appendChild(item);
        });

        searchResults.classList.remove('hidden');
    }

    // ─── Remove highlights anteriores ────────
    function removeAllHighlights() {
        provaSections.forEach(function (s) {
            s.classList.remove('search-highlight');
        });
    }

    // ─── Utilitários ─────────────────────────
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function debounce(fn, delay) {
        var timer;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, delay);
        };
    }

    // ─── Event Listeners ─────────────────────
    searchInput.addEventListener(
        'input',
        debounce(function () {
            performSearch(searchInput.value);
        }, 180)
    );

    // Fechar ao clicar fora
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
            removeAllHighlights();
        }
    });

    // Teclas de atalho
    document.addEventListener('keydown', function (e) {
        // Escape → fecha e limpa
        if (e.key === 'Escape') {
            searchResults.classList.add('hidden');
            searchInput.value = '';
            removeAllHighlights();
            searchInput.blur();
        }

        // "/" → foca na busca (se não estiver em input)
        if (
            e.key === '/' &&
            document.activeElement !== searchInput &&
            document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable
        ) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });

    // ─── Log ─────────────────────────────────
    console.log('🚀 Preparações: NASA — Busca por PROVA ativada!');
    console.log('📚 ' + provasIndex.length + ' provas indexadas.');
    console.log('💡 Digite "/" para buscar ou o nome da prova (ex: "foguete", "criogenia", "robo").');
})();
