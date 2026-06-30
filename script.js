/**
 * ═══════════════════════════════════════════
 *  Preparações: NASA — Search & Navigation
 * ═══════════════════════════════════════════
 *
 * Funcionalidades:
 *  1. Busca em tempo real nos 6 temas
 *  2. Navegação suave ao clicar no resultado
 *  3. Highlight dos termos encontrados
 *  4. Atalho: tecla "/" foca no campo de busca
 */

(function () {
    'use strict';

    // ─── Elementos do DOM ─────────────────
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const sections = document.querySelectorAll('.theme-section');
    const cards = document.querySelectorAll('.card');

    // ─── Construir índice de busca ────────
    // Cada entrada: { sectionId, sectionTitle, cardTitle, textContent, cardElement }
    const searchIndex = [];

    sections.forEach(function (section) {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('h2')
            ? section.querySelector('h2').textContent.replace(/^\d+\s*/, '').trim()
            : '';

        const sectionCards = section.querySelectorAll('.card');
        sectionCards.forEach(function (card) {
            const h3 = card.querySelector('h3');
            const cardTitle = h3 ? h3.textContent.trim() : '';
            const textContent = card.textContent || '';

            searchIndex.push({
                sectionId: sectionId,
                sectionTitle: sectionTitle,
                cardTitle: cardTitle,
                text: textContent.toLowerCase(),
                cardElement: card,
                sectionElement: section,
            });
        });
    });

    // ─── Função de busca ──────────────────
    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            searchResults.classList.add('hidden');
            // Remove highlights
            removeAllHighlights();
            return;
        }

        const q = query.toLowerCase().trim();
        const words = q.split(/\s+/);

        // Buscar: cada palavra deve estar presente no texto
        const matches = searchIndex.filter(function (entry) {
            return words.every(function (word) {
                return entry.text.includes(word);
            });
        });

        // Remover duplicatas (mesmo card pode aparecer em múltiplos matches)
        const uniqueMatches = [];
        const seenCardTitles = new Set();

        matches.forEach(function (match) {
            const key = match.sectionId + '|' + match.cardTitle;
            if (!seenCardTitles.has(key)) {
                seenCardTitles.add(key);
                uniqueMatches.push(match);
            }
        });

        renderResults(uniqueMatches, q, words);
    }

    // ─── Renderizar resultados ────────────
    function renderResults(matches, rawQuery, words) {
        searchResults.innerHTML = '';

        if (matches.length === 0) {
            searchResults.innerHTML =
                '<p class="no-results">🔎 Nenhum resultado encontrado para "<strong>' +
                escapeHTML(rawQuery) +
                '</strong>"</p>';
            searchResults.classList.remove('hidden');
            removeAllHighlights();
            return;
        }

        matches.forEach(function (match) {
            const resultItem = document.createElement('p');
            resultItem.innerHTML =
                '<strong>' +
                escapeHTML(match.sectionTitle) +
                '</strong> → ' +
                escapeHTML(match.cardTitle);

            resultItem.addEventListener('click', function () {
                // Scroll suave até a seção
                match.sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Highlight temporário na seção
                match.sectionElement.style.transition = 'box-shadow 0.3s ease';
                match.sectionElement.style.boxShadow =
                    '0 0 0 4px rgba(59,130,246,0.4), 0 4px 24px rgba(0,0,0,0.3)';
                setTimeout(function () {
                    match.sectionElement.style.boxShadow = '';
                }, 1800);

                // Fechar resultados
                searchResults.classList.add('hidden');
                searchInput.value = '';
                removeAllHighlights();
            });

            searchResults.appendChild(resultItem);
        });

        searchResults.classList.remove('hidden');

        // Highlight nos cards visíveis
        highlightMatches(words);
    }

    // ─── Highlight nos cards ──────────────
    function highlightMatches(words) {
        removeAllHighlights();

        cards.forEach(function (card) {
            const cardText = card.textContent || '';
            const cardLower = cardText.toLowerCase();

            // Verificar se todas as palavras estão presentes
            const allPresent = words.every(function (word) {
                return cardLower.includes(word);
            });

            if (allPresent && words.length > 0) {
                // Adicionar borda sutil de destaque
                card.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
                card.style.borderColor = 'rgba(245,158,11,0.5)';
                card.style.boxShadow = '0 0 0 1px rgba(245,158,11,0.25)';
                card.dataset.highlighted = 'true';
            }
        });
    }

    function removeAllHighlights() {
        cards.forEach(function (card) {
            if (card.dataset.highlighted === 'true') {
                card.style.borderColor = '';
                card.style.boxShadow = '';
                card.dataset.highlighted = '';
            }
        });
    }

    // ─── Utilitário: escape HTML ──────────
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ─── Debounce ──────────────────────────
    function debounce(fn, delay) {
        var timer;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    // ─── Event Listeners ──────────────────
    searchInput.addEventListener(
        'input',
        debounce(function () {
            performSearch(searchInput.value);
        }, 200)
    );

    // Fechar resultados ao clicar fora
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
            removeAllHighlights();
        }
    });

    // Tecla Escape fecha resultados e limpa
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchResults.classList.add('hidden');
            searchInput.value = '';
            removeAllHighlights();
            searchInput.blur();
        }

        // Atalho: "/" foca no campo de busca
        if (
            e.key === '/' &&
            document.activeElement !== searchInput &&
            document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA'
        ) {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // ─── Inicialização ────────────────────
    console.log('🚀 Preparações: NASA — Search Engine pronto!');
    console.log('📚 ' + searchIndex.length + ' cards indexados em ' + sections.length + ' temas.');
    console.log('💡 Dica: pressione "/" para buscar rapidamente.');
})();