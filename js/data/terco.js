// Orações e mistérios do Santo Terço, em português e em latim.

export const ORACOES = {
  sinal: {
    pt: { t: 'Sinal da cruz', x: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.' },
    la: { t: 'Signum Crucis', x: 'In nomine Patris, et Filii, et Spiritus Sancti. Amen.' },
  },
  credo: {
    pt: { t: 'Creio', x: 'Creio em Deus Pai todo-poderoso, criador do céu e da terra. E em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na santa Igreja católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.' },
    la: { t: 'Credo', x: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.' },
  },
  pai: {
    pt: { t: 'Pai-nosso', x: 'Pai nosso, que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.' },
    la: { t: 'Pater noster', x: 'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.' },
  },
  ave: {
    pt: { t: 'Ave-Maria', x: 'Ave, Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.' },
    la: { t: 'Ave Maria', x: 'Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.' },
  },
  gloria: {
    pt: { t: 'Glória', x: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.' },
    la: { t: 'Gloria Patri', x: 'Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.' },
  },
  fatima: {
    pt: { t: 'Ó meu Jesus', x: 'Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno; levai as almas todas para o céu e socorrei principalmente as que mais precisarem.' },
    la: { t: 'O mi Iesu', x: 'O mi Iesu, dimitte nobis debita nostra, libera nos ab igne inferni, conduc in caelum omnes animas, praesertim illas quae maxime indigent misericordia tua.' },
  },
  salve: {
    pt: { t: 'Salve-Rainha', x: 'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria.', r: ['Rogai por nós, santa Mãe de Deus.', 'Para que sejamos dignos das promessas de Cristo.'] },
    la: { t: 'Salve Regina', x: 'Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus, exsules filii Hevae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia, ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, O pia, O dulcis Virgo Maria.', r: ['Ora pro nobis, sancta Dei Genetrix.', 'Ut digni efficiamur promissionibus Christi.'] },
  },
};

// Dia da semana (0 = domingo) -> conjunto de mistérios
export const POR_DIA = ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'luminosos', 'dolorosos', 'gozosos'];

export const MISTERIOS = {
  gozosos: {
    pt: 'Mistérios Gozosos', la: 'Mysteria Gaudiosa', dias: 'Segunda e sábado',
    itens: [
      { pt: 'A Anunciação do Anjo a Nossa Senhora', la: 'Annuntiatio', ref: 'Lc 1,26-38' },
      { pt: 'A Visitação de Nossa Senhora a Santa Isabel', la: 'Visitatio', ref: 'Lc 1,39-56' },
      { pt: 'O Nascimento de Jesus em Belém', la: 'Nativitas', ref: 'Lc 2,1-20' },
      { pt: 'A Apresentação de Jesus no Templo', la: 'Praesentatio in Templo', ref: 'Lc 2,22-38' },
      { pt: 'O Encontro de Jesus no Templo', la: 'Inventio in Templo', ref: 'Lc 2,41-52' },
    ],
  },
  luminosos: {
    pt: 'Mistérios Luminosos', la: 'Mysteria Luminosa', dias: 'Quinta-feira',
    itens: [
      { pt: 'O Batismo de Jesus no Jordão', la: 'Baptisma in Iordane', ref: 'Mt 3,13-17' },
      { pt: 'A autorrevelação de Jesus nas Bodas de Caná', la: 'Nuptiae Canae', ref: 'Jo 2,1-12' },
      { pt: 'O anúncio do Reino de Deus e o convite à conversão', la: 'Annuntiatio Regni', ref: 'Mc 1,14-15' },
      { pt: 'A Transfiguração do Senhor', la: 'Transfiguratio', ref: 'Lc 9,28-36' },
      { pt: 'A instituição da Eucaristia', la: 'Institutio Eucharistiae', ref: 'Lc 22,14-20' },
    ],
  },
  dolorosos: {
    pt: 'Mistérios Dolorosos', la: 'Mysteria Dolorosa', dias: 'Terça e sexta',
    itens: [
      { pt: 'A agonia de Jesus no Horto', la: 'Agonia in Horto', ref: 'Lc 22,39-46' },
      { pt: 'A flagelação de Jesus', la: 'Flagellatio', ref: 'Jo 19,1' },
      { pt: 'A coroação de espinhos', la: 'Coronatio spinis', ref: 'Mt 27,27-31' },
      { pt: 'Jesus carrega a cruz até o Calvário', la: 'Baiulatio Crucis', ref: 'Jo 19,16-17' },
      { pt: 'A crucifixão e morte de Jesus', la: 'Crucifixio et Mors', ref: 'Lc 23,33-46' },
    ],
  },
  gloriosos: {
    pt: 'Mistérios Gloriosos', la: 'Mysteria Gloriosa', dias: 'Quarta e domingo',
    itens: [
      { pt: 'A Ressurreição de Jesus', la: 'Resurrectio', ref: 'Mc 16,1-7' },
      { pt: 'A Ascensão de Jesus ao céu', la: 'Ascensio', ref: 'At 1,6-11' },
      { pt: 'A vinda do Espírito Santo', la: 'Descensus Spiritus Sancti', ref: 'At 2,1-4' },
      { pt: 'A Assunção de Nossa Senhora', la: 'Assumptio', ref: 'Ap 12,1' },
      { pt: 'A coroação de Nossa Senhora como Rainha do céu e da terra', la: 'Coronatio in Caelo', ref: 'Ap 12,1' },
    ],
  },
};

export const ORDINAIS = {
  pt: ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto'],
  la: ['Primum', 'Secundum', 'Tertium', 'Quartum', 'Quintum'],
};

export const INTENCOES_INICIAIS = {
  pt: ['pelo aumento da fé', 'pelo aumento da esperança', 'pelo aumento da caridade'],
  la: ['pro augmento fidei', 'pro augmento spei', 'pro augmento caritatis'],
};

// Monta a sequência completa do terço como uma lista de passos.
export function montarTerco(conjunto) {
  const s = [];
  s.push({ o: 'sinal', grupo: 'inicio' });
  s.push({ o: 'credo', grupo: 'inicio', conta: 'cruz' });
  s.push({ o: 'pai', grupo: 'inicio', conta: 'grande' });
  for (let i = 0; i < 3; i++) s.push({ o: 'ave', grupo: 'inicio', conta: 'pequena', n: i, intencao: i });
  s.push({ o: 'gloria', grupo: 'inicio' });
  for (let m = 0; m < 5; m++) {
    s.push({ o: 'anuncio', grupo: m, conjunto });
    s.push({ o: 'pai', grupo: m, conta: 'grande' });
    for (let i = 0; i < 10; i++) s.push({ o: 'ave', grupo: m, conta: 'pequena', n: i });
    s.push({ o: 'gloria', grupo: m });
    s.push({ o: 'fatima', grupo: m });
  }
  s.push({ o: 'salve', grupo: 'fim' });
  s.push({ o: 'sinal', grupo: 'fim' });
  return s;
}
