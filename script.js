// Tradução e cores dos tipos
    const tiposInfo = {
      normal: { nome: "Normal", cor: "#A8A77A", corFonte: "white" },
      fire: { nome: "Fogo", cor: "#EE8130", corFonte: "white" },
      water: { nome: "Água", cor: "#6390F0", corFonte: "white" },
      electric: { nome: "Elétrico", cor: "#F7D02C", corFonte: "black" },
      grass: { nome: "Grama", cor: "#7AC74C", corFonte: "white" },
      ice: { nome: "Gelo", cor: "#96D9D6", corFonte: "black" },
      fighting: { nome: "Lutador", cor: "#C22E28", corFonte: "white" },
      poison: { nome: "Veneno", cor: "#A33EA1", corFonte: "white" },
      ground: { nome: "Terra", cor: "#E2BF65", corFonte: "white" },
      flying: { nome: "Voador", cor: "#A98FF3", corFonte: "white" },
      psychic: { nome: "Psíquico", cor: "#F95587", corFonte: "white" },
      bug: { nome: "Inseto", cor: "#A6B91A", corFonte: "white" },
      rock: { nome: "Pedra", cor: "#B6A136", corFonte: "white" },
      ghost: { nome: "Fantasma", cor: "#735797", corFonte: "white" },
      dragon: { nome: "Dragão", cor: "#6F35FC", corFonte: "white" },
      dark: { nome: "Sombrio", cor: "#705746", corFonte: "white" },
      steel: { nome: "Aço", cor: "#B7B7CE", corFonte: "white" },
      fairy: { nome: "Fada", cor: "#D685AD", corFonte: "white" }
    };

    // Tradução dos stats
    const traducoesStats = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defesa',
      'special-attack': 'Ataque Especial',
      'special-defense': 'Defesa Especial',
      'speed': 'Velocidade'
    };

    // Elementos DOM
    const inputPokemon = document.getElementById("nomePokemon");
    const botaoBuscar = document.getElementById("buscarPokemon");
    const dadosPokemon = document.getElementById("dadosPokemon");

    // Função para criar badge de tipo
    function criarBadgeTipo(tipo) {
      const info = tiposInfo[tipo];
      if (!info) return '';
      
      return `
        <span class="type-badge" style="background-color: ${info.cor}; color: ${info.corFonte}">
          ${info.nome}
        </span>
      `;
    }

    // Função para criar badge com multiplicador
    function criarBadgeComMultiplicador(tipo, multiplicador) {
      const info = tiposInfo[tipo];
      if (!info) return '';
      
      let textoMultiplicador = '';
      if (multiplicador === 4) textoMultiplicador = ' (4×)';
      else if (multiplicador === 2) textoMultiplicador = '';
      else if (multiplicador === 0.5) textoMultiplicador = '';
      else if (multiplicador === 0.25) textoMultiplicador = ' (¼)';
      else if (multiplicador === 0) textoMultiplicador = '';
      
      return `
        <span class="type-badge" style="background-color: ${info.cor}; color: ${info.corFonte}">
          ${info.nome}${textoMultiplicador}
        </span>
      `;
    }

    // Buscar Pokémon
    async function buscarPokemon(nome) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);
        if (!res.ok) throw new Error("Pokémon não encontrado!");
        return await res.json();
      } catch (error) {
        throw error;
      }
    }

    //buscar especie do pokemon
    async function buscarEspeciePokemon(nome) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${nome.toLowerCase()}`);
        if (!res.ok) throw new Error("Especie não encontrada!");
        return await res.json();
      } catch (error) {
        throw error;
      }
    }

    //buscar cadeia evolutiva do pokemon
    async function buscarCadeiaEvolucaoPokemon(urlCadeiaEvolucao) {
      try {
        const res = await fetch(urlCadeiaEvolucao);
        if (!res.ok) throw new Error("Cadeia não encontrada!");
        return await res.json();
      } catch (error) {
        throw error;
      }
    }

    async function percorrerCadeiaEvolucao(chain) {
      const resultado = [];

      async function percorrer(node, minLevel = null) {
        // Pega os dados do Pokémon (imagem, tipos, stats, etc)
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${node.species.name}`);
        const dadosPokemon = await res.json();

        const imgOfficial = dadosPokemon.sprites.other['official-artwork'].front_default;
        const nomeFormatado = node.species.name.charAt(0).toUpperCase() + node.species.name.slice(1);

        resultado.push({
          nome: nomeFormatado,
          img: imgOfficial,
          lvlParaEvoluir: minLevel
        });

        console.log(resultado);

        for (const evo of node.evolves_to) {
          const detalhe = evo.evolution_details[0]?.min_level || null;
          await percorrer(evo, detalhe);
        }
      }

      await percorrer(chain);
      return resultado;
    }

    // Buscar relações de dano
    async function buscarRelacoesDeDano(tipo) {
      let res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}/`);
      let tipoData = await res.json();

      return {
        fraqueza: tipoData.damage_relations.double_damage_from.map(t => t.name),
        eficaz: tipoData.damage_relations.double_damage_to.map(t => t.name),
        resistente: tipoData.damage_relations.half_damage_from.map(t => t.name),
        poucoEficaz: tipoData.damage_relations.half_damage_to.map(t => t.name),
        ineficaz: tipoData.damage_relations.no_damage_to.map(t => t.name),
        imune: tipoData.damage_relations.no_damage_from.map(t => t.name),
      };
    }

    // Calcular relações de dano
    async function calcularRelacoesDeDanoDoPokemon(tipos) {
      const multiplicadores = {};

      Object.keys(tiposInfo).forEach(tipo => multiplicadores[tipo] = 1);

      for (const tipo of tipos) {
        const relacoes = await buscarRelacoesDeDano(tipo);

        relacoes.fraqueza.forEach(t => multiplicadores[t] *= 2);
        relacoes.resistente.forEach(t => multiplicadores[t] *= 0.5);
        relacoes.imune.forEach(t => multiplicadores[t] *= 0);
      }

      return multiplicadores;
    }

    // Exibir Pokémon
    async function exibirPokemon(nome) {
      try {
        const pokemon = await buscarPokemon(nome);
        const especie = await buscarEspeciePokemon(nome);
        const cadeiaEvolucao = await buscarCadeiaEvolucaoPokemon(especie.evolution_chain.url);
        const evolucoes = await percorrerCadeiaEvolucao(cadeiaEvolucao.chain);

        const nomeFormatado = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const alturaEmMetros = pokemon.height / 10 + " m";
        const pesoEmkG = pokemon.weight / 10 + " kg";
        let tipos = pokemon.types.map(t => t.type.name);

        const multiplicadores = await calcularRelacoesDeDanoDoPokemon(tipos);

        const fraquezas = Object.entries(multiplicadores)
          .filter(([tipo, valor]) => valor > 1)
          .map(([tipo, valor]) => ({ tipo, valor }));

        const poucoEficaz = Object.entries(multiplicadores)
          .filter(([tipo, valor]) => valor < 1 && valor > 0)
          .map(([tipo, valor]) => ({ tipo, valor }));

        const imune = Object.entries(multiplicadores)
          .filter(([tipo, valor]) => valor == 0)
          .map(([tipo, valor]) => ({ tipo, valor }));

        // Monta as linhas da tabela de stats
        let linhasStats = pokemon.stats.map(s => {
          const nomeTraduzido = traducoesStats[s.stat.name] || s.stat.name;
          return `
            <tr>
              <td>${nomeTraduzido}</td>
              <td>${s.base_stat}</td>
            </tr>
          `;
        }).join("");

        // Monta HTML
        dadosPokemon.innerHTML = `
          <div class="pokemon-card">
            <h2 class="pokemon-name">${nomeFormatado} #${pokemon.id.toString().padStart(3, '0')}</h2>
            
            <div class="pokemon-image">
              <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${nomeFormatado}">
            </div>
            
            <div class="types-container">
              ${tipos.map(tipo => criarBadgeTipo(tipo)).join('')}
            </div>
            
            <div class="basic-info">
              <div class="info-item">
                <div class="info-label">Altura</div>
                <div class="info-value">${alturaEmMetros}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Peso</div>
                <div class="info-value">${pesoEmkG}</div>
              </div>
            </div>
            
            <table class="stats-table">
              <tr>
                <th>Atributo</th>
                <th>Valor</th>
              </tr>
              ${linhasStats}
            </table>
            
            <div class="damage-relations">
              <div class="damage-section">
                <h3>Fraquezas</h3>
                <div class="damage-types">
                  ${fraquezas.length > 0 ? fraquezas.map(f => criarBadgeComMultiplicador(f.tipo, f.valor)).join('') : 'Nenhuma'}
                </div>
              </div>
              
              <div class="damage-section">
                <h3>Resistências</h3>
                <div class="damage-types">
                  ${poucoEficaz.length > 0 ? poucoEficaz.map(r => criarBadgeComMultiplicador(r.tipo, r.valor)).join('') : 'Nenhuma'}
                </div>
              </div>
              
              <div class="damage-section">
                <h3>Imunidades</h3>
                <div class="damage-types">
                  ${imune.length > 0 ? imune.map(i => criarBadgeComMultiplicador(i.tipo, i.valor)).join('') : 'Nenhuma'}
                </div>
              </div>
            </div>
          </div>
        `;

        // monta a linha evolutiva
        mostrarLinhaEvolucao(evolucoes);

      } catch (erro) {
        dadosPokemon.innerHTML = `<div class="error">${erro.message}</div>`;
      }
    }

    function mostrarLinhaEvolucao(evolucoes) {
        const container = document.getElementById("linhaEvolucao");
        container.innerHTML = ""; // limpa

        evolucoes.forEach((pokemon, index) => {
          // Card do Pokémon
          const card = document.createElement("div");
          card.classList.add("evo-card");
          card.innerHTML = `
            <img src="${pokemon.img}" alt="${pokemon.nome}">
            <div>${pokemon.nome}</div>
            ${pokemon.lvlParaEvoluir ? `<small>Nível ${pokemon.lvlParaEvoluir}</small>` : ""}
          `;
          container.appendChild(card);

          // Adiciona seta se não for o último Pokémon
          if (index < evolucoes.length - 1) {
            const seta = document.createElement("div");
            seta.classList.add("evo-arrow");
            seta.innerHTML = "➡";
            container.appendChild(seta);
          }
        });
    }


    // Event listeners
    botaoBuscar.addEventListener("click", () => {
      const nome = inputPokemon.value.trim();
      if (!nome) {
        dadosPokemon.innerHTML = "<div class='error'>Digite um nome de Pokémon!</div>";
        return;
      }
      exibirPokemon(nome);
    });

    inputPokemon.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const nome = inputPokemon.value.trim();
        if (!nome) {
          dadosPokemon.innerHTML = "<div class='error'>Digite um nome de Pokémon!</div>";
          return;
        }
        exibirPokemon(nome);
      }
    });